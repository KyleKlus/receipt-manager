/** @format */
import { useEffect, useRef, useState } from 'react';

import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';

import Content from '@/components/Content';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import ShareSyncTokenModal from '@/components/receipt-manager/dashboard/ShareSyncTokenModal';

import Dashboard from '@/components/receipt-manager/dashboard/Dashboard';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import moment from 'moment';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import { useRouter } from 'next/router';

function Home() {
  const authContext: IAuthContext = useAuth();
  const router = useRouter();

  if (authContext.user !== null) {
    router.push(redirectPaths[RedirectPathOptions.DashBoardPage]);
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;