/** @format */
import Content from '@/components/Content';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IDataBaseContext, useDB } from '@/context/DatabaseContext';
import withAuth from '@/components/withAuth';
import styles from '@/styles/Dashboard.module.css';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { useEffect, useRef, useState } from 'react';
import IConnection from '@/interfaces/IConnection';
import ShareSyncTokenModal from '@/components/receipt-manager/ShareSyncTokenModal';
import Card from '@/components/Card';
import Select from 'react-select'
import BillCard from '@/components/receipt-manager/BillCard';
import moment from 'moment';
import { Category } from '@/handlers/DataParser';
import * as DataParser from '../handlers/DataParser';


function Home() {
  const authContext: IAuthContext = useAuth();
  const dbContext: IDataBaseContext = useDB();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newActiveSyncToken, setNewActiveSyncToken] = useState('');
  const [newPendingSyncToken, setNewPendingSyncToken] = useState('');

  const newPendingSyncTokenRef = useRef('');

  const selectConnectionsOptions = dbContext.activeConnections.length > 0
    ? dbContext.activeConnections.map(connection => {
      return { value: connection.token, label: connection.name }
    })
    : [];

  useEffect(() => {
    // Only fetches data on refresh page and when loading is set to true
    async function fetchActiveConnections() {
      const activeConnections = await dbContext.getActiveConnections(authContext.user);
      dbContext.saveSelectedConnection(activeConnections[0].token);
      dbContext.saveActiveConnections(activeConnections);
      setIsLoading(false);
    }

    if (isLoading === true) {
      fetchActiveConnections();
    }
  }, [isLoading])

  useEffect(() => {
    // The selected connection has changed
    fetchBills(dbContext.selectedConnection);
  }, [dbContext.selectedConnection])

  useEffect(() => {
    // Make sure that there is always a new valid syncToken for copying
    if (newPendingSyncTokenRef.current === '' || newPendingSyncToken !== newPendingSyncTokenRef.current) {
      const newToken: string = dbContext.generateNewSyncToken(authContext.user);
      dbContext.addPendingSyncToken(authContext.user, newToken).then(_ => {
        newPendingSyncTokenRef.current = newToken;
        setNewPendingSyncToken(newToken);
      });
    }
  }, [isModalOpen])

  async function fetchBills(selectedConnection: string) {
    if (selectedConnection === '') { return; }
    dbContext.saveBills(await dbContext.getBillsByToken(authContext.user, selectedConnection));
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {!isLoading &&
          <>
            {
              dbContext.activeConnections.length > 0
                ? <Card className={[styles.dashboard].join(' ')}>
                  <div className={[styles.dashboardHeader].join(' ')}>
                    <h2>Dashboard</h2>
                    <div className={[styles.dashboardHeaderControls].join(' ')}>
                      <button className={[styles.addConnectionButton].join(' ')} onClick={() => { setIsModalOpen(true) }}>+ Add a person</button>
                      <Select
                        className={[styles.select].join(' ')}
                        options={selectConnectionsOptions}
                        defaultValue={dbContext.selectedConnection === ''
                          ? selectConnectionsOptions[0]
                          : selectConnectionsOptions.filter(connection => connection.value === dbContext.selectedConnection)[0]}
                        onChange={(e) => {
                          if (e === null) { return; }
                          dbContext.saveSelectedConnection(e.value);
                        }} />
                    </div>
                  </div>
                  <div className={[styles.dashboardContent].join(' ')}>
                    <BillCard reloadBills={() => { fetchBills(dbContext.selectedConnection) }} />
                    {
                      dbContext.bills.map(bill => {
                        return (<BillCard
                          key={DataParser.getDateNameByMoment(bill.date)}
                          bill={bill}
                          reloadBills={() => { fetchBills(dbContext.selectedConnection) }} />);
                      })
                    }
                  </div>
                </Card>
                : <div className={[styles.dashboardStartingScreen].join(' ')}>
                  <h2 className={[].join(' ')}>Connect with other people to be able
                    to settle accounts with them. <br /><br /> If you already shared a token just wait for the other person to add it.</h2>
                  <button className={[styles.addConnectionButton].join(' ')} onClick={() => { setIsModalOpen(true) }}>+ Add a person</button>
                </div>
            }
          </>
        }
      </Content>
      <ShareSyncTokenModal
        isModalOpen={isModalOpen}
        closeModal={() => {
          newPendingSyncTokenRef.current = '';
          setIsLoading(false);
          setNewActiveSyncToken('');
          setIsModalOpen(false);
        }}
        newPendingSyncToken={newPendingSyncToken}
        newActiveSyncToken={newActiveSyncToken}
        generateNewPendingSyncToken={() => {
          const newToken: string = dbContext.generateNewSyncToken(authContext.user);
          dbContext.addPendingSyncToken(authContext.user, newToken).then(_ => {
            newPendingSyncTokenRef.current = newToken;
            setNewPendingSyncToken(newToken);
          });
        }}
        setNewActiveSyncToken={(token: string) => {
          setNewActiveSyncToken(token);
        }}
        addActiveSyncToken={() => {
          dbContext.addActiveSyncToken(authContext.user, newActiveSyncToken).then(isSuccessful => {
            if (isSuccessful) {
              setIsLoading(true);
              setNewActiveSyncToken('');
              setIsModalOpen(false);
            }
          });
        }} />
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;