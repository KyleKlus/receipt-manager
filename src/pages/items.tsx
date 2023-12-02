/** @format */
import Content from '@/components/Content';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IDataBaseContext, useDB } from '@/context/DatabaseContext';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';

function Home() {
  const authContext: IAuthContext = useAuth();
  const dbContext: IDataBaseContext = useDB();

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
      </Content>
    </Layout>
  );
}

// export default withAuth(Home); // reenable when design is done
export default Home;