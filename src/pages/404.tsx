/** @format */

import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';

import Content from '@/lib/container/Content';
import withAuth from '@/lib/withAuth';
import Layout from '@/components/layouts/ReceiptManagerLayout';
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