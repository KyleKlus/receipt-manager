/** @format */
import { useEffect, useRef, useState } from 'react';

import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';

import Content from '@/components/Content';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import ShareSyncTokenModal from '@/components/receipt-manager/ShareSyncTokenModal';

import Dashboard from '@/components/receipt-manager/Dashboard';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';

function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const billDBContext: IBillDataBaseContext = useBillDB();

  const [isModalOpen, setIsModalOpen] = useState(false);
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
        userDBContext.saveSelectedConnection(activeConnections[0].token);
        userDBContext.saveActiveConnections(activeConnections);
      }

      setIsLoading(false);
      userDBContext.moveActivePendingTokensToActiveTokens(authContext.user).then(result => {
        userDBContext.saveActiveConnections(activeConnections.concat(result));
      });
    }

    if (isLoading === true) {
      fetchActiveConnections();
    }
  }, [isLoading])

  useEffect(() => {
    // The selected connection has changed
    fetchBills(userDBContext.selectedConnection);
  }, [userDBContext.selectedConnection])

  async function fetchBills(selectedConnection: string) {
    if (selectedConnection === '') { return; }
    billDBContext.saveBills(await billDBContext.getBillsByToken(authContext.user, selectedConnection));
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {!isLoading &&
          <Dashboard
            isModalOpen={isModalOpen}
            isLoading={isLoading}
            selectConnectionsOptions={selectConnectionsOptions}
            setIsModalOpen={setIsModalOpen}
            fetchBills={fetchBills} />
        }
      </Content>
      <ShareSyncTokenModal
        isModalOpen={isModalOpen}
        setIsLoading={setIsLoading}
        setIsModalOpen={setIsModalOpen}
      />
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;