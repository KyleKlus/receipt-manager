/** @format */
import { useEffect, useState } from 'react';
import moment from 'moment';

import Content from '@/lib/container/Content';
import withAuth from '@/lib/withAuth';

import Layout from '@/components/layouts/ReceiptManagerLayout';
import ShareSyncTokenModal from '@/components/dashboard/ShareSyncTokenModal';
import Dashboard from '@/components/dashboard/Dashboard';

import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';

function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const billDBContext: IBillDataBaseContext = useBillDB();
  const yearDBContext: IYearDataBaseContext = useYearDB();
  const monthDBContext: IMonthDataBaseContext = useMonthDB();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSite, setIsLoadingSite] = useState(true);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectConnectionsOptions = userDBContext.activeConnections.length > 0
    ? userDBContext.activeConnections.map(connection => {
      return { value: connection.token, label: connection.name }
    })
    : [];

  useEffect(() => {
    // Only fetches data on refresh page and when loading is set to true
    if (!isLoadingSite) { return; }

    fetchActiveConnections();
  }, [isLoadingSite])

  useEffect(() => {
    setCurrentYear();
  }, [userDBContext.selectedConnection])

  useEffect(() => {
    setCurrentMonth();
  }, [yearDBContext.currentYear])

  useEffect(() => {
    if (isLoadingSite) {
      setIsLoadingSite(false);
    }
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

    // Create year if no one was created or if current one isnt there
    if (years.filter(year => year.name === moment().startOf('year').format('YYYY')).length === 0) {
      const newYear = await yearDBContext.addYear(authContext.user, userDBContext.selectedConnection);
      if (newYear !== undefined) {
        yearDBContext.saveCurrentYear(newYear);
        years.push(newYear);
      } else {
        yearDBContext.saveCurrentYear(years[0]);
      }
    } else {
      yearDBContext.saveCurrentYear(years.filter(year => year.name === moment().startOf('year').format('YYYY'))[0]);
    }

    yearDBContext.saveYears(years);
  }

  async function setCurrentMonth() {
    if (yearDBContext.currentYear === undefined) { return; }

    const months = await monthDBContext.getMonths(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name);

    if ( // Create new month if there are no months in this year or if the year is the current one and it doesnt have the current month in it
      (yearDBContext.currentYear.name === moment().startOf('year').format('YYYY') &&
        months.filter(month => month.name === moment().startOf('month').format('MM-YYYY')).length === 0) ||
      months.length === 0
    ) {
      const newMonth = await monthDBContext.addMonth(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name);

      if (newMonth !== undefined) {
        monthDBContext.saveCurrentMonth(newMonth);
        months.push(newMonth);
      } else {
        monthDBContext.saveCurrentMonth(months[0]);
      }

    } else if (yearDBContext.currentYear.name === moment().startOf('year').format('YYYY')) { // select current month of current year if it is selected
      monthDBContext.saveCurrentMonth(months.filter(month => month.name === moment().startOf('month').format('MM-YYYY'))[0]);
    } else {
      monthDBContext.saveCurrentMonth(months[0]);
    }

    monthDBContext.saveMonths(months);
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
        {!isLoadingSite &&
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
        setIsLoading={setIsLoadingSite}
        setIsModalOpen={setIsModalOpen}
      />
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;