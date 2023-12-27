/** @format */
import styles from '@/styles/components/receipt-manager/items-page/ItemsPage.module.css';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import Select from 'react-select';
import Card from '../../Card';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { useEffect, useState } from 'react';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IReceipt } from '@/interfaces/data/IReceipt';
import ViewableReceipt from './ViewableReceipt/ViewableReceipt';


interface IItemsPageProps {
    isLoading: boolean;
    selectConnectionsOptions: { value: string, label: string }[];
}

export default function ItemsPage(props: React.PropsWithChildren<IItemsPageProps>) {
    const authDB: IAuthContext = useAuth();
    const userDB: IUserDataBaseContext = useUserDB();
    const accountingDB: IAccountingDataBaseContext = useAccountingDB();
    const billDB: IBillDataBaseContext = useBillDB();

    const [isInEditMode, setEditMode] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [progress, setProgress] = useState(0);
    const [receipts, setReceipts] = useState<IReceipt[]>([]);

    useEffect(() => {
        if (isLoadingItems && !props.isLoading) {
            loadAllReceipts();
        }
    }, [isLoadingItems, props.isLoading])

    async function loadAllReceipts() {
        // TODO: Implement page wise loading
        // TODO: Implement date filter beforehand
    }

    return (
        <>
            <Card className={[styles.itemsPage].join(' ')}>
                <div className={[styles.itemsPageHeader].join(' ')}>
                    <h2>Items</h2>
                    <div className={[styles.itemsPageHeaderControls].join(' ')}>
                        <div className={[styles.itemsPageHeaderModeWrapper].join(' ')}>
                            <button disabled={isInEditMode} onClick={() => { setEditMode(true) }}>Edit</button>
                            <button disabled={!isInEditMode} onClick={() => { setEditMode(false) }}>View</button>
                        </div>
                        <Select
                            className={[styles.select].join(' ')}
                            options={props.selectConnectionsOptions}
                            defaultValue={userDB.selectedConnection === ''
                                ? props.selectConnectionsOptions[0]
                                : props.selectConnectionsOptions.filter(connection => connection.value === userDB.selectedConnection)[0]}
                            onChange={(e) => {
                                if (e === null) { return; }
                                userDB.saveSelectedConnection(e.value);
                            }} />
                    </div>
                </div>
                {isLoadingItems
                    ? <div className={[styles.itemsPageLoadingContent].join(' ')}>
                        <progress value={progress} max={100}></progress>
                    </div>
                    : <div className={[styles.itemsPageContent].join(' ')}>
                        {receipts.length !== 0 &&
                            receipts.map(receipt => {
                                return (<ViewableReceipt
                                    key={receipt.receiptId}
                                    receipt={receipt}
                                    isInEditMode={isInEditMode}
                                />);
                            })
                        }
                        {receipts.length === 0 &&
                            <div>This site is under construction</div>
                        }
                    </div>
                }
            </Card>
        </>
    );
}
