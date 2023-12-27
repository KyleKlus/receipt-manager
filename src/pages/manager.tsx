/** @format */
import Content from '@/components/Content';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import ReceiptManager from '@/components/receipt-manager/manager/ReceiptManager';
import { use, useEffect, useRef, useState } from 'react';
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
    checkForErrors();
  })

  async function checkForErrors() {

    if (router.query.date === undefined ||
      router.query.token === undefined || router.query.year === undefined || router.query.month === undefined ||
      (router.query.token !== undefined &&
        !(await userDBContext.hasUserTokenAccess(authContext.user, router.query.token as string)))
    ) {
      router.push(redirectPaths[RedirectPathOptions.DashBoardPage])
    } else if (billDBContext.currentBill === undefined && router.query.date !== undefined) {
      userDBContext.saveSelectedConnection(router.query.token as string);
      const currentBill: IBill | undefined = await billDBContext.getBill(
        authContext.user,
        router.query.token as string,
        router.query.year as string,
        router.query.month as string,
        router.query.date as string
      );
      if (currentBill !== undefined) {
        billDBContext.saveCurrentBill(currentBill);
      }

      if (yearDBContext.currentYear === undefined && router.query.year !== undefined) {
        const currentYear: IYear | undefined = await yearDBContext.getYear(
          authContext.user,
          router.query.token as string,
          router.query.year as string
        );
        if (currentYear !== undefined) {
          yearDBContext.saveCurrentYear(currentYear);
        }
      }

      if (monthDBContext.currentMonth === undefined && router.query.month !== undefined) {
        const currentMonth: IMonth | undefined = await monthDBContext.getMonth(
          authContext.user,
          router.query.token as string,
          router.query.year as string,
          router.query.month as string,
        );
        if (currentMonth !== undefined) {
          monthDBContext.saveCurrentMonth(currentMonth);
        }
      }
    }
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