/** @format */
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { Category } from '@/handlers/DataParser';
import styles from '@/styles/components/receipt-manager/manager/receipt/Item.module.css';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

import * as DataParser from '@/handlers/DataParser';
import { IReceiptItem } from '@/interfaces/data/IReceiptItem';

interface IItemRowProps {
    updateItemInReceipt: (item: IReceiptItem | undefined, isBigUpdate: boolean) => Promise<void>;
    item: IReceiptItem;
    isInEditMode: boolean;
    className?: string;
}

export default function ItemRow(props: React.PropsWithChildren<IItemRowProps>) {
    const accountingDB: IAccountingDataBaseContext = useAccountingDB();
    const auth: IAuthContext = useAuth();

    const [item, setItem] = useState(props.item);
    const [unsavedItem, setUnsavedItem] = useState(props.item);
    const [isInEditMode, setIsInEditMode] = useState(props.isInEditMode);

    useEffect(() => {
        setItem(props.item);
        setIsInEditMode(props.isInEditMode);
    }, [props]);

    const selectableCategories = (Object.keys(Category) as Array<keyof typeof Category>)
        .slice((Object.keys(Category).length / 2)).map(category => { return { value: category, label: category } });

    const row = isInEditMode
        ? <div className={[styles.itemEditRow].join(' ')}>
            <input
                type='number'
                placeholder='Amount'
                className={[styles.itemAmount].join(' ')}
                value={item.amount}
                onChange={async (e) => {
                    if (e === null) { return; }
                    const amount = parseInt(e.currentTarget.value);

                    setUnsavedItem(item => ({ ...item, amount: amount }));
                }}
            />
            <input
                type='text'
                placeholder='Name'
                className={[styles.itemName].join(' ')}
                value={item.name}
                onChange={async (e) => {
                    if (e === null) { return; }
                    const name = e.currentTarget.value;

                    setUnsavedItem(item => ({ ...item, name: name }));
                }}
            />
            <input
                type='number'
                placeholder='Price'
                className={[styles.itemPrice].join(' ')}
                value={item.price.toFixed(2)}
                onChange={async (e) => {
                    if (e === null) { return; }
                    const price = parseFloat(e.currentTarget.value);

                    setUnsavedItem(item => ({ ...item, price: price }));
                }}
            />
            <div className={[styles.itemEditButtonsWrapper].join(' ')}>
                <button className={[styles.itemEditButton].join(' ')} onClick={async () => {
                    await props.updateItemInReceipt(unsavedItem, true);
                }}>
                💾</button>
                <button className={[styles.itemEditButton].join(' ')} onClick={async () => {
                    await props.updateItemInReceipt(undefined, true);
                }}
                >❌</button>
            </div>
        </div>
        : <div key={item.itemId} className={[styles.itemRow].join(' ')}>
            <div className={[styles.itemAmount].join(' ')}>{item.amount}</div>
            <div className={[styles.itemName].join(' ')}>{item.name}</div>
            <div className={[styles.itemPrice].join(' ')}>{item.price.toFixed(2)} €</div>
            <div className={[styles.itemPayerButtons].join(' ')}>
                <div
                    className={[
                        styles.itemPayerButton,
                        styles.isMine,
                        item.ownerUids.length === 1 &&
                            item.ownerUids[0] === accountingDB.firstUid ? styles.isChecked : ''
                    ].join(' ')}
                    onClick={async (e) => {
                        if (!(item.ownerUids.length === 1 &&
                            item.ownerUids[0] === accountingDB.firstUid) && auth.user !== null) {
                            const updatedItem = item;

                            updatedItem.ownerUids = [accountingDB.firstUid];
                            setItem(updatedItem);

                            await props.updateItemInReceipt(updatedItem, false);
                        }
                    }} />
                <div
                    className={[
                        styles.itemPayerButton,
                        styles.isShared,
                        item.ownerUids.length > 1 || item.ownerUids.length === 0 ? styles.isChecked : ''
                    ].join(' ')}
                    onClick={async (e) => {
                        if (!(item.ownerUids.length > 1 || item.ownerUids.length === 0) && auth.user !== null) {
                            const updatedItem = item;

                            updatedItem.ownerUids = [accountingDB.firstUid, accountingDB.secondUid];
                            setItem(updatedItem);

                            await props.updateItemInReceipt(updatedItem, false);
                        }
                    }} />
                <div
                    className={[
                        styles.itemPayerButton,
                        styles.isOther,
                        item.ownerUids.length === 1 &&
                            item.ownerUids[0] === accountingDB.secondUid ? styles.isChecked : ''
                    ].join(' ')}
                    onClick={async (e) => {
                        if (!(item.ownerUids.length === 1 &&
                            item.ownerUids[0] === accountingDB.secondUid) && auth.user !== null) {
                            const updatedItem = item;

                            updatedItem.ownerUids = [accountingDB.secondUid];
                            setItem(updatedItem);

                            await props.updateItemInReceipt(updatedItem, false);
                        }
                    }} />
            </div>
            <Select
                className={[styles.itemSelect].join(' ')}
                placeholder={'Select category'}
                options={selectableCategories}
                defaultValue={selectableCategories.filter(category => category.value === DataParser.getNameOfCategory(item.category))[0]}
                onChange={async (e) => {
                    if (e === null) { return; }
                    const updatedItem = item;

                    updatedItem.category = DataParser.getCategoryByName(e.value);
                    setItem(updatedItem);

                    await props.updateItemInReceipt(updatedItem, false);
                }} />
        </div>

    return (row);
}
