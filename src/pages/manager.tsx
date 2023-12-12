/** @format */
import Content from '@/components/Content';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IDataBaseContext, useDB } from '@/context/DatabaseContext';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import ReceiptManager from '@/components/receipt-manager/manager/ReceiptManager';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

function Home() {
  const dateRef = useRef('');
  const [date, setDate] = useState(dateRef.current);
  const authContext: IAuthContext = useAuth();
  const dbContext: IDataBaseContext = useDB();
  const router = useRouter();

  useEffect(() => {
    checkForErrors();
  })

  useEffect(() => {
    dateRef.current = date;
  }, [date])

  async function checkForErrors() {
    if (router.query.date === undefined ||
      router.query.token === undefined ||
      (router.query.token !== undefined &&
        !(await dbContext.hasUserTokenAccess(authContext.user, router.query.token as string)))
    ) {
      router.push(redirectPaths[RedirectPathOptions.DashBoardPage])
    } else if (dateRef.current === '' && router.query.date !== undefined) {
      setDate(router.query.date as string);
      dbContext.saveSelectedConnection(router.query.token as string);
    }
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {date !== '' &&
          <ReceiptManager billDate={dateRef.current} />
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;