/** @format */
import { useState, useEffect } from 'react';
import moment from 'moment';

import Content from '@/lib/container/Content';
import withAuth from '@/lib/withAuth';

import Layout from '@/components/layouts/ReceiptManagerLayout';
import ItemsPage from '@/components/items-page/ItemsPage';

import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';

function Home() {
  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const yearDBContext: IYearDataBaseContext = useYearDB();
  const monthDBContext: IMonthDataBaseContext = useMonthDB();

  const [isLoadingSite, setIsLoadingSite] = useState(true);

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


  return (
    <Layout>
      <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
        {!isLoadingSite &&
          <ItemsPage isLoading={isLoadingSite} selectConnectionsOptions={selectConnectionsOptions} />
        }
      </Content>
    </Layout>
  );
}

export default withAuth(Home); // reenable when design is done
// export default Home;