/** @format */
import styles from '@/styles/components/receipt-manager/dashboard/Dashboard.module.css';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import Select from 'react-select';
import Card from '../../Card';
import BillCard from './BillCard';
import * as DataParser from '@/handlers/DataParser';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';


interface IDashboardProps {
    isModalOpen: boolean;
    isLoading: boolean;
    selectConnectionsOptions: { value: string, label: string }[];
    setIsModalOpen: (state: boolean) => void;
    fetchBills: (token: string) => {}
}

export default function Dashboard(props: React.PropsWithChildren<IDashboardProps>) {
    const authContext: IAuthContext = useAuth();
    const dbContext: IUserDataBaseContext = useUserDB();
    const billDBContext: IBillDataBaseContext = useBillDB();
    return (
        <>
            {dbContext.activeConnections.length > 0
                ? <Card className={[styles.dashboard].join(' ')}>
                    <div className={[styles.dashboardHeader].join(' ')}>
                        <h2>Dashboard</h2>
                        <div className={[styles.dashboardHeaderControls].join(' ')}>
                            <button className={[styles.addConnectionButton].join(' ')} onClick={() => { props.setIsModalOpen(true) }}>+ Add a person</button>
                            <Select
                                className={[styles.select].join(' ')}
                                options={props.selectConnectionsOptions}
                                defaultValue={dbContext.selectedConnection === ''
                                    ? props.selectConnectionsOptions[0]
                                    : props.selectConnectionsOptions.filter(connection => connection.value === dbContext.selectedConnection)[0]}
                                onChange={(e) => {
                                    if (e === null) { return; }
                                    dbContext.saveSelectedConnection(e.value);
                                }} />
                        </div>
                    </div>
                    <div className={[styles.dashboardContent].join(' ')}>
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
