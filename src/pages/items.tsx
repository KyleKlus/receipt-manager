/** @format */
import Content from '@/components/Content';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ItemsPage from '@/components/receipt-manager/items-page/ItemsPage';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import moment from 'moment';

function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const yearDBContext: IYearDataBaseContext = useYearDB();
  const monthDBContext: IMonthDataBaseContext = useMonthDB();

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const selectConnectionsOptions = userDBContext.activeConnections.length > 0
    ? userDBContext.activeConnections.map(connection => {
      return { value: connection.token, label: connection.name }
    })
    : [];

  useEffect(() => {
    // Only fetches data on refresh page and when loading is set to true
    if (!isLoading) { return; }

    fetchActiveConnections().then(_ => {
      setCurrentYear().then(_ => {
        setCurrentMonth().then(_ => {
          setIsLoading(false);
          //TODO: implement item loading

        })
      });
    });
  }, [isLoading])

  useEffect(() => {
    // The selected connection has changed
    if (isLoading) { return }

    setCurrentYear().then(_ => {
      setCurrentMonth().then(_ => {
        //TODO: implement item loading

      })
    });
  }, [userDBContext.selectedConnection])

  useEffect(() => {
    // The selected connection has changed
    if (isLoading) { return }

    setCurrentMonth().then(_ => {
      //TODO: implement item loading

    })
  }, [yearDBContext.currentYear])

  useEffect(() => {
    // The selected connection has changed
    if (isLoading) { return }

    //TODO: implement item loading
  }, [monthDBContext.currentMonth])

  async function fetchActiveConnections() {
    const activeConnections = await userDBContext.getActiveConnections(authContext.user);
    if (activeConnections.length > 0) {
      userDBContext.saveSelectedConnection(
        router.query.token as string !== undefined &&
          activeConnections
            .filter(connection => connection.token === router.query.token as string).length === 1
          ? router.query.token as string
          : activeConnections[0].token
      );
      userDBContext.saveActiveConnections(activeConnections);
    }
  }

  async function setCurrentYear() {
    const years = await yearDBContext.getYears(authContext.user, userDBContext.selectedConnection);
    if (years.length > 0) {
      const currentYear = router.query.year !== undefined
        ? await yearDBContext.getYear(authContext.user, userDBContext.selectedConnection, router.query.year as string)
        : years[0]
      yearDBContext.saveCurrentYear(currentYear === undefined ? years[0] : currentYear);
      yearDBContext.saveYears(years);
    }
  }

  async function setCurrentMonth() {
    const months = await monthDBContext.getMonths(authContext.user, userDBContext.selectedConnection, moment().startOf('year').format('YYYY'));
    if (months.length > 0 && yearDBContext.currentYear !== undefined) {
      const currentMonth = router.query.month !== undefined
        ? await monthDBContext.getMonth(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name, router.query.month as string)
        : months[0]
      monthDBContext.saveCurrentMonth(currentMonth === undefined ? months[0] : currentMonth);
      monthDBContext.saveMonths(months);
    }
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {!isLoading &&
          <ItemsPage isLoading={isLoading} selectConnectionsOptions={selectConnectionsOptions} />
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;