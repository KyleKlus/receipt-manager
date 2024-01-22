/** @format */
import React, { useState } from 'react';

import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IAuthContext, useAuth } from '@/context/AuthContext';

import styles from '@/styles/components/manager/receipt/Item.module.css';

import * as DataParser from '@/handlers/DataParser';

import { IReceiptItem } from '@/interfaces/data/IReceiptItem';

interface IAddItemRowProps {
    addItemInReceipt: (item: IReceiptItem) => Promise<void>;
    className?: string;
}

export default function AddItemRow(props: React.PropsWithChildren<IAddItemRowProps>) {
    const accountingDB: IAccountingDataBaseContext = useAccountingDB();
    const auth: IAuthContext = useAuth();

    const [unsavedItem, setUnsavedItem] = useState({
        itemId: accountingDB.generateNewId(),
        name: '',
        price: 0,
        amount: 0,
        category: DataParser.DEFAULT_CATEGORY,
        ownerUids: [accountingDB.firstUid, accountingDB.secondUid]
    });

    return (
        <div className={[styles.itemEditRow, props.className].join(' ')}>
            <input
                type='number'
                placeholder='Amount'
                className={[styles.itemAmount].join(' ')}
                value={unsavedItem.amount}
                onChange={async (e) => {
                    if (e === null) { return; }
                    const amount = parseInt(e.currentTarget.value);

                    setUnsavedItem(item => ({ ...item, amount: amount }));

                }}
            />
            <input
                value={unsavedItem.name}
                type='text'
                placeholder='Add Name'
                className={[styles.itemName].join(' ')}
                onChange={async (e) => {
                    if (e === null) { return; }
                    const name = e.currentTarget.value;

                    setUnsavedItem(item => ({ ...item, name: name }));
                }}
            />
            <input
                value={unsavedItem.price.toFixed(2)}
                type='number'
                placeholder='Price'
                className={[styles.itemPrice].join(' ')}
                onChange={async (e) => {
                    if (e === null) { return; }
                    const price = parseFloat(e.currentTarget.value);

                    setUnsavedItem(item => ({ ...item, price: price }));
                }}
            />
            <div className={[styles.itemEditButtonsWrapper].join(' ')}>
                <button className={[styles.itemEditButton].join(' ')} onClick={async () => {
                    await props.addItemInReceipt(unsavedItem).then(_ => {
                        setUnsavedItem({
                            itemId: accountingDB.generateNewId(),
                            name: '',
                            price: 0,
                            amount: 0,
                            category: DataParser.DEFAULT_CATEGORY,
                            ownerUids: [accountingDB.firstUid, accountingDB.secondUid]
                        })
                    });
                }}>➕</button>
                <button className={[styles.itemEditButton].join(' ')} onClick={async () => {
                    setUnsavedItem({
                        itemId: unsavedItem.itemId,
                        name: '',
                        price: 0,
                        amount: 0,
                        category: unsavedItem.category,
                        ownerUids: unsavedItem.ownerUids
                    })
                }}
                >🗑️</button>
            </div>
        </div>
    );
}
