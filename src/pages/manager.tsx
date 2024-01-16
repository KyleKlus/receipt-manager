/** @format */
import Content from '@/components/Content';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import ReceiptManager from '@/components/receipt-manager/manager/ReceiptManager';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import IBill from '@/interfaces/data/IBill';
import * as DataParser from '@/handlers/DataParser';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import IYear from '@/interfaces/data/IYear';
import IMonth from '@/interfaces/data/IMonth';


function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const billDBContext: IBillDataBaseContext = useBillDB();
  const yearDBContext: IYearDataBaseContext = useYearDB();
  const monthDBContext: IMonthDataBaseContext = useMonthDB();
  const router = useRouter();

  useEffect(() => {
    checkForErrorsAndLoadData();
  })

  async function checkForErrorsAndLoadData() {
    if (
      isRouterQueryDataWrong() ||
      (router.query.token !== undefined &&
        !(await userDBContext.hasUserTokenAccess(authContext.user, router.query.token as string))
      )
    ) {
      router.push(redirectPaths[RedirectPathOptions.DashBoardPage]) // Redirect to dashboard if any router query data is wrong
    } else if (billDBContext.currentBill === undefined && router.query.date !== undefined) { // Setup data if it isn't setup
      await loadData();
    }
  }

  async function loadData() {
    const token: string = router.query.token as string;
    const year: string = router.query.year as string;
    const month: string = router.query.month as string;
    const date: string = router.query.date as string;

    userDBContext.saveSelectedConnection(token);

    if (yearDBContext.currentYear === undefined && router.query.year !== undefined) {
      const currentYear: IYear | undefined = await yearDBContext.getYear(
        authContext.user,
        token,
        year,
      );

      if (currentYear !== undefined) {
        yearDBContext.saveCurrentYear(currentYear);
      }
    }

    if (monthDBContext.currentMonth === undefined && router.query.month !== undefined) {
      const currentMonth: IMonth | undefined = await monthDBContext.getMonth(
        authContext.user,
        token,
        year,
        month,
      );

      if (currentMonth !== undefined) {
        monthDBContext.saveCurrentMonth(currentMonth);
      }
    }

    const currentBill: IBill | undefined = await billDBContext.getBill(
      authContext.user,
      token,
      year,
      month,
      date
    );

    if (currentBill !== undefined) {
      billDBContext.saveCurrentBill(currentBill);
    }
  }

  function isRouterQueryDataWrong(): boolean {
    return router.query.date === undefined ||
      router.query.token === undefined ||
      router.query.year === undefined ||
      router.query.month === undefined;
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {billDBContext.currentBill !== undefined &&
          userDBContext.selectedConnection !== '' &&
          yearDBContext.currentYear !== undefined &&
          monthDBContext.currentMonth !== undefined &&
          <ReceiptManager
            billDate={billDBContext.currentBill.name}
            token={userDBContext.selectedConnection}
            currentYearName={yearDBContext.currentYear.name}
            currentMonthName={monthDBContext.currentMonth.name}
          />
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;