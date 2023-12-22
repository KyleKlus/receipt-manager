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

function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const billDBContext: IBillDataBaseContext = useBillDB();

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

      setIsLoading(false);
    }

    if (isLoading === true) {
      fetchActiveConnections();
    }
  }, [isLoading])

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {isLoading &&
          <StatisticsPage isLoading={isLoading} selectConnectionsOptions={selectConnectionsOptions} />
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;