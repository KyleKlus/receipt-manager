/** @format */
import { useEffect, useRef, useState } from 'react';

import { IAuthContext, useAuth } from '@/context/AuthContext';
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

function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const billDBContext: IBillDataBaseContext = useBillDB();
  const yearDBContext: IYearDataBaseContext = useYearDB();
  const monthDBContext: IMonthDataBaseContext = useMonthDB();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBills, setIsLoadingBills] = useState(true);
  const [progress, setProgress] = useState(0);


  const selectConnectionsOptions = userDBContext.activeConnections.length > 0
    ? userDBContext.activeConnections.map(connection => {
      return { value: connection.token, label: connection.name }
    })
    : [];


  useEffect(() => {
    // Only fetches data on refresh page and when loading is set to true
    if (!isLoading) { return; }

    fetchActiveConnections().then(_ => {
      setCurrentYear().then(_ => {
        setCurrentMonth().then(_ => {
          setIsLoading(false);
          fetchBills(userDBContext.selectedConnection);
        })
      });
    });
  }, [isLoading])

  useEffect(() => {
    // The selected connection has changed
    if (isLoading) { return }

    setCurrentYear().then(_ => {
      setCurrentMonth().then(_ => {
        fetchBills(userDBContext.selectedConnection, userDBContext.prevSelectedConnection);
      })
    });
  }, [userDBContext.selectedConnection])

  useEffect(() => {
    // The selected connection has changed
    if (isLoading) { return }

    setCurrentMonth().then(_ => {
      fetchBills(userDBContext.selectedConnection, userDBContext.prevSelectedConnection);
    })
  }, [yearDBContext.currentYear])

  useEffect(() => {
    // The selected connection has changed
    if (isLoading) { return }

    fetchBills(userDBContext.selectedConnection, userDBContext.prevSelectedConnection);
  }, [monthDBContext.currentMonth])

  async function fetchActiveConnections() {
    const activeConnections = await userDBContext.getActiveConnections(authContext.user);
    if (activeConnections.length > 0) {
      userDBContext.saveSelectedConnection(activeConnections[0].token);
      userDBContext.saveActiveConnections(activeConnections);
    }

    userDBContext.moveActivePendingTokensToActiveTokens(authContext.user).then(result => {
      userDBContext.saveActiveConnections(activeConnections.concat(result));
    });
  }

  async function setCurrentYear() {
    const years = await yearDBContext.getYears(authContext.user, userDBContext.selectedConnection);
    if (years.length > 0) {
      yearDBContext.saveCurrentYear(years[0]);
      yearDBContext.saveYears(years);
    } else {
      const newYear = await yearDBContext.addYear(authContext.user, userDBContext.selectedConnection);
      if (newYear !== undefined) {
        yearDBContext.saveCurrentYear(newYear);
        yearDBContext.saveYears([newYear]);
      }
    }
  }

  async function setCurrentMonth() {
    if (yearDBContext.currentYear === undefined) { return; }
    const months = await monthDBContext.getMonths(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name);
    if (months.length > 0) {
      monthDBContext.saveCurrentMonth(months[0]);
      monthDBContext.saveMonths(months);

    } else {
      const newMonth = await monthDBContext.addMonth(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name);
      if (newMonth !== undefined) {
        monthDBContext.saveCurrentMonth(newMonth);
        monthDBContext.saveMonths([newMonth]);
      }
    }
  }

  async function fetchBills(selectedConnection: string, prevSelectedConnection?: string) {
    if (
      selectedConnection === '' ||
      (prevSelectedConnection !== undefined && (selectedConnection === prevSelectedConnection)) ||
      yearDBContext.currentYear === undefined ||
      monthDBContext.currentMonth === undefined
    ) {
      return;
    }

    setProgress(0);
    setIsLoadingBills(true);
    const bills = await billDBContext.getBills(
      authContext.user,
      selectedConnection,
      yearDBContext.currentYear.name,
      monthDBContext.currentMonth.name
    );

    setProgress((1 / (bills.length + 1)) * 100);
    for (let index = 0; index < bills.length; index++) {
      const updatedBill = await billDBContext.updateBillStats(
        authContext.user,
        selectedConnection,
        yearDBContext.currentYear.name,
        monthDBContext.currentMonth.name,
        bills[index],
        true
      );
      setProgress(((index + 2) / (bills.length + 1)) * 100);
      if (updatedBill !== undefined) {
        bills[index] = updatedBill;
      }
    }

    billDBContext.saveBills(bills);
    setIsLoadingBills(false);
    setProgress(0);
  }

  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {!isLoading &&
          <Dashboard
            isLoadingBills={isLoadingBills}
            progress={progress}
            selectConnectionsOptions={selectConnectionsOptions}
            setIsModalOpen={setIsModalOpen}
            fetchBills={fetchBills} />
        }
      </Content>
      <ShareSyncTokenModal
        isModalOpen={isModalOpen}
        setIsLoading={setIsLoading}
        setIsModalOpen={setIsModalOpen}
      />
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;