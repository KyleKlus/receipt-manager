/** @format */
import styles from '@/styles/components/receipt-manager/manager/ReceiptManager.module.css';
import { useEffect, useId, useState } from 'react';
import { IReceipt } from '@/interfaces/data/IReceipt';
import UploadSection from './UploadSection';
import ResultSection from './ResultSection';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';

interface IReceiptManagerProps {
    billDate: string;
    token: string;
    currentYearName: string;
    currentMonthName: string;
}

export default function ReceiptManager(props: React.PropsWithChildren<IReceiptManagerProps>) {
    const authContext: IAuthContext = useAuth();
    const userDBContext: IUserDataBaseContext = useUserDB();
    const accountingDBContext: IAccountingDataBaseContext = useAccountingDB();

    const [isResultReady, setIsResultReady] = useState(false);
    const [isStatsReady, setIsStatsReady] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (shouldLoad && !isLoading) {
            setShouldLoad(false);
            setIsLoading(true);
            loadData();
        }
    })

    async function setResultReady(state: boolean) {
        setIsResultReady(state);
        setIsStatsReady(state);
        // if (state) {
        //     accountingDBContext.saveReceipts(await updateReceiptStats(accountingDBContext.firstReceipts), true);
        //     accountingDBContext.saveReceipts(await updateReceiptStats(accountingDBContext.secondReceipts), false);
        // }
    }

    async function loadData() {
        await loadUids();

        await loadNames();

        setIsLoading(false);
    }

    async function loadNames() {
        if (authContext.user === null) { return; }

        const name = authContext.user.displayName === null
            ? 'User-' + crypto.randomUUID().split('-')[0]
            : authContext.user.displayName.split(' ')[0]

        accountingDBContext.saveName(name, true);
        const secondPersonName: string = await userDBContext.getUserNameByToken(authContext.user, props.token);

        accountingDBContext.saveName(secondPersonName.split(' ')[0], false);
    }

    async function loadUids() {
        if (authContext.user === null) { return; }

        accountingDBContext.saveUid(authContext.user.uid, true);
        const secondPersonUid: string = await userDBContext.getUserUidByToken(authContext.user, props.token);
        accountingDBContext.saveUid(secondPersonUid, false);
    }

    async function loadReceipts(isFirst: boolean) {
        if (authContext.user === null) { return; }

        const loadByUid = isFirst ? accountingDBContext.firstUid : accountingDBContext.secondUid;

        const receipts = await updateReceiptStats(await accountingDBContext.getReceiptsByUid(authContext.user, props.token, props.currentYearName,
            props.currentMonthName, props.billDate, loadByUid, true));

        accountingDBContext.saveReceipts(receipts, isFirst);
    }

    async function updateReceiptStats(receipts: IReceipt[]): Promise<IReceipt[]> {
        if (authContext.user === null) { return []; }

        for (let index = 0; index < receipts.length; index++) {
            const receipt = receipts[index];
            const updatedReceipt = await accountingDBContext.updateReceiptStats(authContext.user, props.token, props.currentYearName,
                props.currentMonthName, props.billDate, receipt);

            if (updatedReceipt !== undefined) {
                receipts[index] = updatedReceipt;
            }
        }

        return receipts;
    }

    return (
        <div className={[styles.receiptManager].join(' ')}>
            {!isLoading && !shouldLoad &&
                <>
                    <UploadSection
                        setResultReady={setResultReady}
                        className={[isResultReady ? styles.isHidden : ''].join(' ')}
                    />
                    <ResultSection
                        isResultReady={isResultReady}
                        setResultReady={setResultReady}
                        className={[!isResultReady ? styles.isHidden : ''].join(' ')}
                    />
                </>
            }
            {/* TODO: add Loading spinner */}
        </div>
    );
}
