/** @format */
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from 'templates/context/AuthContext';

import Content from '@/components/container/Content';
import withAuth from '@/components/withAuth';
import Layout from '@/components/layouts/Layout';
import { useRouter } from 'next/router';

function Home() {
  const authContext: IAuthContext = useAuth();
  const router = useRouter();

  if (authContext.user !== null) {
    router.push(redirectPaths[RedirectPathOptions.LockedPage]);
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