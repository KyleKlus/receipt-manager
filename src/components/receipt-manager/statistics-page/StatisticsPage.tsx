/** @format */
import styles from '@/styles/components/receipt-manager/statistics-page/StatisticsPage.module.css';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import Select from 'react-select';
import Card from '@/components/container/Card';
import * as DataParser from '@/handlers/DataParser';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';


interface IStatisticsPageProps {
    isLoading: boolean;
    selectConnectionsOptions: { value: string, label: string }[];
}

export default function StatisticsPage(props: React.PropsWithChildren<IStatisticsPageProps>) {
    const authContext: IAuthContext = useAuth();
    const dbContext: IUserDataBaseContext = useUserDB();
    const billDBContext: IBillDataBaseContext = useBillDB();
    return (
        <>
            <Card className={[styles.statisticsPage].join(' ')}>
                <div className={[styles.statisticsPageHeader].join(' ')}>
                    <h2>Statistics</h2>
                    <div className={[styles.statisticsPageHeaderControls].join(' ')}>
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
                <div className={[styles.statisticsPageContent].join(' ')}>
                    <div>This site is under construction</div>
                </div>
            </Card>
        </>
    );
}
