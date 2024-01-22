/** @format */
import { useEffect, useState } from 'react';

import withAuth from '@/lib/withAuth';
import Content from '@/lib/container/Content';
import Card from '@/lib/container/Card';

import Layout from '@/components/layouts/ReceiptManagerLayout';
import styles from '@/styles/components/settings/SettingsPage.module.css';

import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';

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