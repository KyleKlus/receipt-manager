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
import * as DataParser from '@/handlers/DataParser';


function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const billDBContext: IBillDataBaseContext = useBillDB();
  const router = useRouter();

  useEffect(() => {
    checkForErrors();
  })

  async function checkForErrors() {

    if (router.query.date === undefined ||
      router.query.token === undefined ||
      (router.query.token !== undefined &&
        !(await userDBContext.hasUserTokenAccess(authContext.user, router.query.token as string)))
    ) {
      router.push(redirectPaths[RedirectPathOptions.DashBoardPage])
    } else if (billDBContext.currentBill === undefined && router.query.date !== undefined) {
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
        {billDBContext.currentBill !== undefined && userDBContext.selectedConnection !== '' &&
          <ReceiptManager billDate={DataParser.getDateNameByMoment(billDBContext.currentBill.date)} token={userDBContext.selectedConnection} />
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;