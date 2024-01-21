/** @format */
import Content from '@/components/container/Content';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import withAuth from '@/components/withAuth';
import Layout from '@/components/layouts/ReceiptManagerLayout';
import Card from '@/components/container/Card';
import styles from '@/styles/components/receipt-manager/settings/SettingsPage.module.css';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { useEffect, useState } from 'react';


function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const accountingDBContext: IAccountingDataBaseContext = useAccountingDB();

  const [currentName, setCurrentName] = useState('');
  const [isLoadingName, setIsLoadingName] = useState(true);

  useEffect(() => {
    if (!isLoadingName) { return }
    loadName();
  })

  async function loadName() {
    if (authContext.user === null) { return; }

    const name = await userDBContext.getUserNameByUid(authContext.user, authContext.user.uid);

    accountingDBContext.saveName(name, true);
    setCurrentName(name);
    setIsLoadingName(false);
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {!isLoadingName &&
          <Card className={[styles.settings].join(' ')}>
            <h2>Username: </h2>
            <input type='text' value={currentName} onChange={(e) => {
              setCurrentName(e.currentTarget.value);
            }} />
            <button onClick={async () => {
              if (authContext.user === null) { return; }
              await userDBContext.setUserNameByUid(authContext.user, authContext.user.uid, currentName);
            }}>💾</button>
          </Card>
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;