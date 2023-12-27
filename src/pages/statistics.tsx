/** @format */
import Content from '@/components/Content';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import IBill from '@/interfaces/data/IBill';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import StatisticsPage from '@/components/receipt-manager/statistics-page/StatisticsPage';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import moment from 'moment';

function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const yearDBContext: IYearDataBaseContext = useYearDB();
  const monthDBContext: IMonthDataBaseContext = useMonthDB();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const selectConnectionsOptions = userDBContext.activeConnections.length > 0
    ? userDBContext.activeConnections.map(connection => {
      return { value: connection.token, label: connection.name }
    })
    : [];

  useEffect(() => {
    // Only fetches data on refresh page and when loading is set to true
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
        yearDBContext.saveCurrentYear(years[0]);
        yearDBContext.saveYears(years);
      }
    }

    async function setCurrentMonth() {
      const months = await monthDBContext.getMonths(authContext.user, userDBContext.selectedConnection, moment().startOf('year').format('YYYY'));
      if (months.length > 0) {
        monthDBContext.saveCurrentMonth(months[0]);
        monthDBContext.saveMonths(months);
      }
    }

    if (isLoading === true) {
      fetchActiveConnections().then(_ => {
        setCurrentYear().then(_ => {
          setCurrentMonth().then(_ => {
            setIsLoading(false);
          })
        });
      });
    }
  }, [isLoading])

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {!isLoading &&
          <StatisticsPage isLoading={isLoading} selectConnectionsOptions={selectConnectionsOptions} />
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;