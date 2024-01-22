/** @format */
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IReceipt } from '@/interfaces/data/IReceipt';
import styles from '@/styles/components/manager/receipt/Receipt.module.css';
import itemStyles from '@/styles/components/manager/receipt/Item.module.css';
import React, { useState } from 'react';

import * as DataParser from '@/handlers/DataParser';

interface IAddReceiptProps {
    className?: string;
    addReceipt: (receipt: IReceipt) => Promise<void>;
}

export default function AddReceipt(props: React.PropsWithChildren<IAddReceiptProps>) {
    const accountingDB: IAccountingDataBaseContext = useAccountingDB();

    const [unsavedReceipt, setUnsavedReceipt] = useState({
        receiptId: accountingDB.generateNewId(),
        payedByUid: '',
        store: '',
        totalPrice: 0,
        mostCommonCategory: DataParser.DEFAULT_CATEGORY,
        amount: 0,
        items: [],
        categoryMetaData: [],
        mostExpensiveItem: undefined,
        needsRefresh: true
    });

    return (
        <div className={[styles.receipt, styles.addReceipt, props.className].join(' ')}>
            <div className={[styles.receiptEditWrapper].join(' ')}>
                <input
                    className={[styles.receiptTitle].join(' ')}
                    type='text'
                    placeholder='Add receipt'
                    value={unsavedReceipt.store}
                    onChange={(e) => {
                        setUnsavedReceipt(unsavedReceipt => ({
                            ...unsavedReceipt,
                            store: e.target.value
                        }));
                    }}
                />
                <div className={[itemStyles.itemEditButtonsWrapper].join(' ')}>
                    <button className={[itemStyles.itemEditButton].join(' ')} onClick={async () => {
                        if (unsavedReceipt.store === '') { return }
                        await props.addReceipt(unsavedReceipt).then(_ => {
                            setUnsavedReceipt({
                                receiptId: accountingDB.generateNewId(),
                                payedByUid: '',
                                store: '',
                                totalPrice: 0,
                                mostCommonCategory: DataParser.DEFAULT_CATEGORY,
                                amount: 0,
                                items: [],
                                categoryMetaData: [],
                                mostExpensiveItem: undefined,
                                needsRefresh: true
                            });
                        });
                    }}>➕</button>
                </div>
            </div>
        </div>
    );
}
