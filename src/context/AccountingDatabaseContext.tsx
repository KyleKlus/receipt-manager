import { createContext, useContext, useRef, useState } from 'react';
import React from 'react';

import * as userDBService from '@/services/fireStores/firebaseUserStore';
import * as receiptDBService from '@/services/fireStores/firebaseReceiptStore';
import * as itemDBService from '@/services/fireStores/firebaseItemStore';
import * as dbService from '@/services/fireStores/firebaseStore';
import { User } from 'firebase/auth';
import { IReceipt } from '@/interfaces/data/IReceipt';
import { IReceiptItem } from '@/interfaces/data/IReceiptItem';

export interface IAccountingDataBaseContext {
    firstName: string,
    secondName: string,
    firstReceipts: IReceipt[],
    secondReceipts: IReceipt[],
    saveName: (name: string, isFirst: boolean) => void
    saveReceipts: (receipts: IReceipt[], isFirst: boolean) => void,
    getReceipts: (user: User | null, token: string, date: string) => Promise<IReceipt[]>
    generateNewId: (user: User | null) => string,
    addReceipt: (user: User | null, token: string, date: string, receipt: IReceipt) => Promise<boolean>;
    updateReceipt: (user: User | null, token: string, date: string, receiptId: string, receipt: IReceipt) => Promise<boolean>;
    deleteReceipt: (user: User | null, token: string, date: string, receiptId: string) => Promise<boolean>;
    getItems: (user: User | null, token: string, date: string, receiptId: string) => Promise<IReceiptItem[]>;
    addItemToReceipt: (user: User | null, token: string, date: string, receiptId: string, item: IReceiptItem) => Promise<boolean>;
    deleteItem: (user: User | null, token: string, date: string, receiptId: string, itemId: string) => Promise<boolean>;
    updateItem: (user: User | null, token: string, date: string, receiptId: string, itemId: string, item: IReceiptItem) => Promise<boolean>;
}

const defaultValue: IAccountingDataBaseContext = {
    firstName: '',
    secondName: '',
    firstReceipts: [],
    secondReceipts: [],
    saveName: (name: string, isFirst: boolean) => { return; },
    saveReceipts: (receipts: IReceipt[], isFirst: boolean) => { return new Promise<void>(() => { }); },
    getReceipts: (user: User | null, token: string, date: string) => { return new Promise<IReceipt[]>(() => { }); },
    generateNewId: (user: User | null) => { return ''; },
    addReceipt: (user: User | null, token: string, date: string, receipt: IReceipt) => { return new Promise<boolean>(() => { }); },
    updateReceipt: (user: User | null, token: string, date: string, receiptId: string, receipt: IReceipt) => { return new Promise<boolean>(() => { }); },
    deleteReceipt: (user: User | null, token: string, date: string, receiptId: string) => { return new Promise<boolean>(() => { }); },
    getItems: (user: User | null, token: string, date: string, receiptId: string) => { return new Promise<IReceiptItem[]>(() => { }); },
    addItemToReceipt: (user: User | null, token: string, date: string, receiptId: string, item: IReceiptItem) => { return new Promise<boolean>(() => { }); },
    deleteItem: (user: User | null, token: string, date: string, receiptId: string, itemId: string) => { return new Promise<boolean>(() => { }); },
    updateItem: (user: User | null, token: string, date: string, receiptId: string, itemId: string, item: IReceiptItem) => { return new Promise<boolean>(() => { }); },
}

const AccountingDataBaseContext: React.Context<IAccountingDataBaseContext> = createContext<IAccountingDataBaseContext>(defaultValue);

const AccountingDataBaseProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [firstName, setFirstName] = useState<string>('');
    const [firstReceipts, setFirstReceipts] = useState<IReceipt[]>([]);

    const [secondName, setSecondName] = useState<string>('');
    const [secondReceipts, setSecondReceipts] = useState<IReceipt[]>([]);

    function saveName(name: string, isFirst: boolean) {
        if (isFirst) {
            setFirstName(name);
        } else {
            setSecondName(name);
        }
    }

    function saveReceipts(receipts: IReceipt[], isFirst: boolean) {
        if (isFirst) {
            setFirstReceipts(receipts);
        } else {
            setSecondReceipts(receipts);
        }
    }

    function generateNewId(): string {
        return crypto.randomUUID().split('-').slice(0, -1).join('-');
    }

    async function getReceipts(user: User | null, token: string, date: string): Promise<IReceipt[]> {
        console.log('test')

        return await receiptDBService.getReceipts(user, token, date);
    }

    async function addReceipt(user: User | null, token: string, date: string, receipt: IReceipt): Promise<boolean> {
        return await receiptDBService.addReceipt(user, token, date, receipt);
    }

    async function updateReceipt(user: User | null, token: string, date: string, receiptId: string, receipt: IReceipt): Promise<boolean> {
        return await receiptDBService.updateReceipt(user, token, date, receiptId, receipt);
    }

    async function deleteReceipt(user: User | null, token: string, date: string, receiptId: string): Promise<boolean> {
        return await receiptDBService.deleteReceipt(user, token, date, receiptId);
    }

    async function getItems(user: User | null, token: string, date: string, receiptId: string): Promise<IReceiptItem[]> {
        return await itemDBService.getItems(user, token, date, receiptId);
    }

    async function addItemToReceipt(user: User | null, token: string, date: string, receiptId: string, item: IReceiptItem): Promise<boolean> {
        return await itemDBService.addReceiptItem(user, token, date, receiptId, item);
    }

    async function deleteItem(user: User | null, token: string, date: string, receiptId: string, itemId: string): Promise<boolean> {
        return await itemDBService.deleteReceiptItem(user, token, date, receiptId, itemId);
    }

    async function updateItem(user: User | null, token: string, date: string, receiptId: string, itemId: string, item: IReceiptItem): Promise<boolean> {
        return await itemDBService.updateReceiptItem(user, token, date, receiptId, itemId, item);
    }

    return <AccountingDataBaseContext.Provider value={{
        firstName,
        secondName,
        firstReceipts,
        secondReceipts,
        saveName,
        saveReceipts,
        generateNewId,
        getReceipts,
        addReceipt,
        deleteReceipt,
        updateReceipt,
        getItems,
        addItemToReceipt,
        deleteItem,
        updateItem
    }}>{props.children}</AccountingDataBaseContext.Provider>;
};

export default AccountingDataBaseProvider;

export const useAccountingDB = () => {
    return useContext(AccountingDataBaseContext);
}