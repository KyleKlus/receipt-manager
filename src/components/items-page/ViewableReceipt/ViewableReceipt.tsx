/** @format */
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import { IReceipt } from '@/interfaces/data/IReceipt';
import styles from '@/styles/components/manager/receipt/Receipt.module.css';
import itemStyles from '@/styles/components/manager/receipt/Item.module.css';
import React, { useEffect, useState } from 'react';

import { IReceiptItem } from '@/interfaces/data/IReceiptItem';
import ViewableItemRow from './ViewableItemRow';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';

interface IReceiptProps {
    receipt: IReceipt;
    isInEditMode: boolean;
    className?: string;
}

export default function Receipt(props: React.PropsWithChildren<IReceiptProps>) {
    const accountingDB: IAccountingDataBaseContext = useAccountingDB();
    const billDB: IBillDataBaseContext = useBillDB();
    const userDB: IUserDataBaseContext = useUserDB();
    const yearDBContext: IYearDataBaseContext = useYearDB();
    const monthDBContext: IMonthDataBaseContext = useMonthDB();
    const auth: IAuthContext = useAuth();

    const [unsavedStore, setUnsavedStore] = useState('');
    const [receipt, setReceipt] = useState(props.receipt);
    const [items, setItems] = useState(props.receipt.items);
    const [isInEditMode, setIsInEditMode] = useState(props.isInEditMode);

    useEffect(() => {
        setReceipt(props.receipt);
        setItems(props.receipt.items);
        setIsInEditMode(props.isInEditMode);
    }, [props]);

    async function _updateItemInReceipt(updatedItem: IReceiptItem, index: number, isBigUpdate: boolean) {
        if (auth.user === null || billDB.currentBill === undefined ||
            yearDBContext.currentYear === undefined ||
            monthDBContext.currentMonth === undefined) { return; }

        await accountingDB.updateItem(
            auth.user,
            userDB.selectedConnection,
            yearDBContext.currentYear.name,
            monthDBContext.currentMonth.name,
            billDB.currentBill.name,
            receipt.receiptId,
            updatedItem
        ).then(async _ => {
            let updatedReceipt: IReceipt | undefined = receipt;

            if (isBigUpdate) {
                if (auth.user === null || billDB.currentBill === undefined ||
                    yearDBContext.currentYear === undefined ||
                    monthDBContext.currentMonth === undefined) { return; }

                updatedReceipt = await accountingDB.updateReceiptStats(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name,
                    monthDBContext.currentMonth.name, billDB.currentBill.name, receipt);
                if (updatedReceipt === undefined) { return; }
            } else {
                updatedReceipt.items[index] = updatedItem;
            }

            setReceipt(updatedReceipt);
            setItems([...updatedReceipt.items]);
        })
    }

    return (
        <div className={[styles.receipt, props.className].join(' ')}>
            {isInEditMode
                ? <div className={[styles.receiptTitleWrapper].join(' ')}>
                    <input
                        className={[styles.receiptTitle].join(' ')}
                        type='text'
                        defaultValue={receipt.store}
                        onChange={(e) => {
                            setUnsavedStore(e.currentTarget.value);
                        }}
                    />
                    <div className={[itemStyles.itemEditButtonsWrapper].join(' ')}>
                        <button className={[itemStyles.itemEditButton].join(' ')} onClick={async () => {
                            if (billDB.currentBill === undefined ||
                                yearDBContext.currentYear === undefined ||
                                monthDBContext.currentMonth === undefined) { return; }
                            const updatedReceipt = receipt;
                            updatedReceipt.store = unsavedStore;
                            await accountingDB.updateReceipt(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name,
                                monthDBContext.currentMonth.name, billDB.currentBill.name, receipt).then(_ => {
                                    setReceipt(updatedReceipt);
                                });
                        }}>Save</button>
                    </div>
                </div>
                : <div className={[styles.receiptTitle].join(' ')}>{receipt.store} | {receipt.totalPrice.toFixed(2)}€</div>
            }

            <div className={[styles.receiptContent].join(' ')}>
                {items.map((item, index) => {
                    return (
                        <ViewableItemRow
                            key={item.itemId}
                            updateItemInReceipt={async (updatedItem: IReceiptItem, isBigUpdate: boolean) => {
                                if (
                                    updatedItem.name === '' ||
                                    billDB.currentBill === undefined
                                ) {
                                    return new Promise(() => { });
                                }

                                return await _updateItemInReceipt(updatedItem, index, isBigUpdate);
                            }}
                            item={item}
                            isInEditMode={isInEditMode}
                        />
                    );
                })}
            </div>
        </div>
    );
}
