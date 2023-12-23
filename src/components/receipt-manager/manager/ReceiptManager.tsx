/** @format */
import styles from '@/styles/components/receipt-manager/manager/ReceiptManager.module.css';
import { useEffect, useState } from 'react';
import { IReceipt } from '@/interfaces/data/IReceipt';
import * as DataParser from '@/handlers/DataParser';
import { Category } from '@/handlers/DataParser';
import { IReceiptItem } from '@/interfaces/data/IReceiptItem';
import UploadSection from './UploadSection';
import ResultSection from './ResultSection';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';

interface IReceiptManagerProps {
    billDate: string;
    token: string
}

export default function ReceiptManager(props: React.PropsWithChildren<IReceiptManagerProps>) {
    const authContext: IAuthContext = useAuth();
    const userDBContext: IUserDataBaseContext = useUserDB();
    const accountingDBContext: IAccountingDataBaseContext = useAccountingDB();

    const [isResultReady, setIsResultReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        if (isLoading) {
            loadData();
        }
    })

    async function setResultReady(state: boolean) {
        setIsResultReady(state);
        if (state) {
            accountingDBContext.saveReceipts(await updateReceiptStats(accountingDBContext.firstReceipts), true);
            accountingDBContext.saveReceipts(await updateReceiptStats(accountingDBContext.secondReceipts), false);
        }
    }

    async function loadData() {
        await loadNames();

        await loadUids();

        await loadReceipts();

        setIsLoading(false);
    }

    async function loadNames() {
        if (authContext.user === null) { return; }
        if (authContext.user.displayName == null) { return; }

        accountingDBContext.saveName(authContext.user.displayName.split(' ')[0], true);
        const secondPersonName: string = await userDBContext.getUserNameByToken(authContext.user, props.token);

        accountingDBContext.saveName(secondPersonName.split(' ')[0], false);
    }

    async function loadUids() {
        if (authContext.user === null) { return; }
        if (authContext.user.displayName == null) { return; }

        accountingDBContext.saveUid(authContext.user.uid, true);
        const secondPersonUid: string = await userDBContext.getUserUidByToken(authContext.user, props.token);
        accountingDBContext.saveUid(secondPersonUid, false);
    }

    async function loadReceipts() {
        if (authContext.user === null) { return; }
        if (authContext.user.displayName == null) { return; }

        const receipts = await updateReceiptStats(await accountingDBContext.getReceipts(authContext.user, props.token, props.billDate));

        const firstReceipts = receipts.filter(receipt => receipt.payedByUid === authContext.user?.uid);
        accountingDBContext.saveReceipts(firstReceipts, true);

        const secondReceipts = receipts.filter(receipt => receipt.payedByUid !== authContext.user?.uid);
        accountingDBContext.saveReceipts(secondReceipts, false);
    }

    async function updateReceiptStats(receipts: IReceipt[]): Promise<IReceipt[]> {
        if (authContext.user === null) { return []; }
        if (authContext.user.displayName == null) { return []; }

        for (let index = 0; index < receipts.length; index++) {
            const receipt = receipts[index];
            const updatedReceipt = await accountingDBContext.updateReceiptStats(authContext.user, props.token, props.billDate, receipt);

            if (updatedReceipt !== undefined) {
                receipts[index] = updatedReceipt;
            }
        }

        return receipts;
    }

    return (
        <div className={[styles.receiptManager].join(' ')}>
            {!isLoading &&
                <>
                    {!isResultReady
                        ? <UploadSection setResultReady={setResultReady} />
                        : <ResultSection setResultReady={setResultReady} />
                    }
                </>
            }
        </div>
    );
}
