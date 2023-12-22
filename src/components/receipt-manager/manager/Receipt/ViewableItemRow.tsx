/** @format */
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { Category } from '@/handlers/DataParser';
import styles from '@/styles/components/receipt-manager/manager/receipt/Item.module.css';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

import * as DataParser from '@/handlers/DataParser';
import { IReceiptItem } from '@/interfaces/data/IReceiptItem';

interface IItemRowProps {
    updateItemInReceipt: (item: IReceiptItem, isBigUpdate: boolean) => Promise<void>;
    item: IReceiptItem;
    isInEditMode: boolean;
    className?: string;
}

export default function ItemRow(props: React.PropsWithChildren<IItemRowProps>) {
    const accountingDB: IAccountingDataBaseContext = useAccountingDB();

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
            <div
                className={[styles.itemAmount].join(' ')}
            >{item.amount}</div>
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
            <div
                className={[styles.itemPrice].join(' ')}
            >{item.price.toFixed(2)}</div>
            <div className={[styles.itemEditButtonsWrapper].join(' ')}>
                <button className={[styles.itemEditButton].join(' ')} onClick={async () => {
                    await props.updateItemInReceipt(unsavedItem, false);
                }}>Save</button>
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
                />
                <div
                    className={[
                        styles.itemPayerButton,
                        styles.isShared,
                        item.ownerUids.length > 1 || item.ownerUids.length === 0 ? styles.isChecked : ''
                    ].join(' ')}
                />
                <div
                    className={[
                        styles.itemPayerButton,
                        styles.isOther,
                        item.ownerUids.length === 1 &&
                            item.ownerUids[0] === accountingDB.secondUid ? styles.isChecked : ''
                    ].join(' ')}
                />
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

                    await props.updateItemInReceipt(updatedItem, false);
                }} />
        </div>
    return (row);
}
