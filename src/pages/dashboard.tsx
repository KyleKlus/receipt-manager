/** @format */
import { useEffect, useRef, useState } from 'react';

import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IDataBaseContext, useDB } from '@/context/DatabaseContext';

import Content from '@/components/Content';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import ShareSyncTokenModal from '@/components/receipt-manager/ShareSyncTokenModal';

import Dashboard from '@/components/receipt-manager/Dashboard';

function Home() {
  const authContext: IAuthContext = useAuth();
  const dbContext: IDataBaseContext = useDB();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  const selectConnectionsOptions = dbContext.activeConnections.length > 0
    ? dbContext.activeConnections.map(connection => {
      return { value: connection.token, label: connection.name }
    })
    : [];

  useEffect(() => {
    // Only fetches data on refresh page and when loading is set to true
    async function fetchActiveConnections() {
      const activeConnections = await dbContext.getActiveConnections(authContext.user);
      if (activeConnections.length > 0) {
        dbContext.saveSelectedConnection(activeConnections[0].token);
        dbContext.saveActiveConnections(activeConnections);
      }

      setIsLoading(false);
      dbContext.moveActivePendingTokensToActiveTokens(authContext.user).then(result => {
        dbContext.saveActiveConnections(activeConnections.concat(result));
      });
    }

    if (isLoading === true) {
      fetchActiveConnections();
    }
  }, [isLoading])

  useEffect(() => {
    // The selected connection has changed
    fetchBills(dbContext.selectedConnection);
  }, [dbContext.selectedConnection])

  async function fetchBills(selectedConnection: string) {
    if (selectedConnection === '') { return; }
    dbContext.saveBills(await dbContext.getBillsByToken(authContext.user, selectedConnection));
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