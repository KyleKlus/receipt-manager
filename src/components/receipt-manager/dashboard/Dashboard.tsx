/** @format */
import styles from '@/styles/components/receipt-manager/dashboard/Dashboard.module.css';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import Select from 'react-select';
import Card from '../../Card';
import BillCard from './BillCard';
import * as DataParser from '@/handlers/DataParser';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { useEffect, useState } from 'react';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';


interface IDashboardProps {
    progress: number;
    isLoadingBills: boolean;
    selectConnectionsOptions: { value: string, label: string }[];
    setIsModalOpen: (state: boolean) => void;
    fetchBills: (token: string, prevSelectedConnection?: string) => {}
}

export default function Dashboard(props: React.PropsWithChildren<IDashboardProps>) {
    const authContext: IAuthContext = useAuth();
    const dbContext: IUserDataBaseContext = useUserDB();
    const billDBContext: IBillDataBaseContext = useBillDB();
    const yearDBContext: IYearDataBaseContext = useYearDB();
    const monthDBContext: IMonthDataBaseContext = useMonthDB();

    const [isLoadingBills, setIsLoadingBills] = useState(props.isLoadingBills);
    const [progress, setProgress] = useState(props.progress);
    const [selectYearOptions, setSelectYearOptions] = useState(yearDBContext.years.length > 0
        ? yearDBContext.years.map(year => {
            return { value: year.name, label: year.name }
        })
        : []);
    const [selectMonthOptions, setSelectMonthOptions] = useState(monthDBContext.months.length > 0
        ? monthDBContext.months.map(month => {
            return { value: month.name, label: month.date.format('MMM') }
        })
        : []);

    useEffect(() => {
        setIsLoadingBills(props.isLoadingBills);
        setProgress(props.progress);
    }, [props]);

    useEffect(() => {
        setSelectYearOptions(yearDBContext.years.length > 0
            ? yearDBContext.years.map(year => {
                return { value: year.name, label: year.name }
            })
            : [])
    }, [yearDBContext.currentYear])

    useEffect(() => {
        setSelectMonthOptions(monthDBContext.months.length > 0
            ? monthDBContext.months.map(month => {
                return { value: month.name, label: month.date.format('MMM') }
            })
            : [])
    }, [monthDBContext.currentMonth])


    return (
        <>
            {dbContext.activeConnections.length > 0
                ? <Card className={[styles.dashboard].join(' ')}>
                    <div className={[styles.dashboardHeader].join(' ')}>
                        <h2>Dashboard 📖</h2>
                        <div className={[styles.dashboardHeaderControls].join(' ')}>
                            <Select
                                className={[styles.select].join(' ')}
                                options={props.selectConnectionsOptions}
                                value={dbContext.selectedConnection === ''
                                    ? props.selectConnectionsOptions[0]
                                    : props.selectConnectionsOptions.filter(connection => connection.value === dbContext.selectedConnection)[0]}
                                onChange={(e) => {
                                    if (e === null) { return; }
                                    dbContext.saveSelectedConnection(e.value);
                                }} />
                            <button className={[styles.addConnectionButton].join(' ')} onClick={() => { props.setIsModalOpen(true) }}>➕</button>
                            <hr />
                            <Select
                                className={[styles.select, selectYearOptions.length === 0 ? styles.isHidden : ''].join(' ')}
                                options={selectMonthOptions}
                                value={monthDBContext.currentMonth !== undefined && monthDBContext.currentMonth.name === ''
                                    ? selectMonthOptions[0]
                                    : selectMonthOptions.filter(month => month.value === monthDBContext.currentMonth?.name)[0]}
                                onChange={(e) => {
                                    if (e === null) { return; }
                                    monthDBContext.saveCurrentMonth(monthDBContext.months.filter(month => month.name === e.value)[0]);
                                }} />
                            <Select
                                className={[styles.select, selectYearOptions.length === 0 ? styles.isHidden : ''].join(' ')}
                                options={selectYearOptions}
                                value={yearDBContext.currentYear !== undefined && yearDBContext.currentYear.name === ''
                                    ? selectYearOptions[0]
                                    : selectYearOptions.filter(year => year.value === yearDBContext.currentYear?.name)[0]}
                                onChange={(e) => {
                                    if (e === null) { return; }
                                    yearDBContext.saveCurrentYear(yearDBContext.years.filter(year => year.name === e.value)[0]);
                                }} />
                        </div>
                    </div>
                    {isLoadingBills
                        ? <div className={[styles.dashboardLoadingContent].join(' ')}>
                            <progress value={progress} max={100}></progress>
                        </div>
                        : <div className={[styles.dashboardContent].join(' ')}>
                            <BillCard reloadBills={() => { props.fetchBills(dbContext.selectedConnection) }} />
                            {
                                billDBContext.bills.map(bill => {
                                    return (<BillCard
                                        key={DataParser.getDateNameByMoment(bill.date)}
                                        bill={bill}
                                        reloadBills={() => { props.fetchBills(dbContext.selectedConnection) }} />);
                                })
                            }
                        </div>
                    }
                </Card>
                : <div className={[styles.dashboardStartingScreen].join(' ')}>
                    <h2 className={[].join(' ')}>Connect with other people to be able
                        to settle accounts with them. <br /><br /> If you already shared a token just wait for the other person to add it.</h2>
                    <button className={[styles.addConnectionButton].join(' ')} onClick={() => { props.setIsModalOpen(true) }}>+ Add a person</button>
                </div>
            }
        </>
    );
}
