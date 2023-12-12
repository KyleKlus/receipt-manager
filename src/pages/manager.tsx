/** @format */
import Content from '@/components/Content';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import ReceiptManager from '@/components/receipt-manager/manager/ReceiptManager';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import IBill from '@/interfaces/data/IBill';

function Home() {
  const dateRef = useRef('');
  const tokenRef = useRef('');
  const [date, setDate] = useState(dateRef.current);
  const [token, setToken] = useState(tokenRef.current);
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const billDBContext: IBillDataBaseContext = useBillDB();
  const router = useRouter();

  useEffect(() => {
    checkForErrors();
  })

  useEffect(() => {
    dateRef.current = date;
  }, [date])

  useEffect(() => {
    tokenRef.current = token;
  }, [token])

  async function checkForErrors() {
    if (router.query.date === undefined ||
      router.query.token === undefined ||
      (router.query.token !== undefined &&
        !(await userDBContext.hasUserTokenAccess(authContext.user, router.query.token as string)))
    ) {
      router.push(redirectPaths[RedirectPathOptions.DashBoardPage])
    } else if (dateRef.current === '' && router.query.date !== undefined) {
      setDate(router.query.date as string);
      setToken(router.query.token as string);
      userDBContext.saveSelectedConnection(router.query.token as string);
      const currentBill: IBill | undefined = await billDBContext.getBillByTokenAndDate(authContext.user, router.query.token as string, router.query.date as string);
      if (currentBill !== undefined) {
        billDBContext.saveCurrentBill(currentBill);
      }
    }
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {date !== '' && token !== '' &&
          <ReceiptManager billDate={dateRef.current} token={tokenRef.current} />
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;