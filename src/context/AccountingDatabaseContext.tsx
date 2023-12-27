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
    firstUid: string,
    secondUid: string,
    firstReceipts: IReceipt[],
    secondReceipts: IReceipt[],
    saveName: (name: string, isFirst: boolean) => void
    saveUid: (uid: string, isFirst: boolean) => void
    saveReceipts: (receipts: IReceipt[], isFirst: boolean) => void,
    getReceipts: (user: User | null, token: string, year: string, month: string, date: string, shouldPreloadItems: boolean) => Promise<IReceipt[]>
    generateNewId: () => string,
    addReceipt: (user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt) => Promise<boolean>,
    updateReceipt: (user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt) => Promise<boolean>,
    updateReceiptStats: (user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt) => Promise<IReceipt | undefined>,
    deleteReceipt: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string) => Promise<boolean>,
    getItems: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string) => Promise<IReceiptItem[]>,
    addItemToReceipt: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string, item: IReceiptItem) => Promise<boolean>,
    deleteItem: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string, itemId: string) => Promise<boolean>,
    updateItem: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string, item: IReceiptItem) => Promise<boolean>
}

const defaultValue: IAccountingDataBaseContext = {
    firstName: '',
    secondName: '',
    firstUid: '',
    secondUid: '',
    firstReceipts: [],
    secondReceipts: [],
    saveName: (name: string, isFirst: boolean) => { return; },
    saveUid: (uid: string, isFirst: boolean) => { return; },
    saveReceipts: (receipts: IReceipt[], isFirst: boolean) => { return new Promise<void>(() => { }); },
    getReceipts: (user: User | null, token: string, year: string, month: string, date: string, shouldPreloadItems: boolean) => { return new Promise<IReceipt[]>(() => { }); },
    generateNewId: () => { return ''; },
    addReceipt: (user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt) => { return new Promise<boolean>(() => { }); },
    updateReceipt: (user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt) => { return new Promise<boolean>(() => { }); },
    updateReceiptStats: (user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt) => { return new Promise<IReceipt | undefined>(() => { }); },
    deleteReceipt: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string) => { return new Promise<boolean>(() => { }); },
    getItems: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string) => { return new Promise<IReceiptItem[]>(() => { }); },
    addItemToReceipt: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string, item: IReceiptItem) => { return new Promise<boolean>(() => { }); },
    deleteItem: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string, itemId: string) => { return new Promise<boolean>(() => { }); },
    updateItem: (user: User | null, token: string, year: string, month: string, date: string, receiptId: string, item: IReceiptItem) => { return new Promise<boolean>(() => { }); },
}

const AccountingDataBaseContext: React.Context<IAccountingDataBaseContext> = createContext<IAccountingDataBaseContext>(defaultValue);

const AccountingDataBaseProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [firstName, setFirstName] = useState<string>('');
    const [firstUid, setFirstUid] = useState<string>('');
    const [firstReceipts, setFirstReceipts] = useState<IReceipt[]>([]);

    const [secondName, setSecondName] = useState<string>('');
    const [secondUid, setSecondUid] = useState<string>('');
    const [secondReceipts, setSecondReceipts] = useState<IReceipt[]>([]);

    function saveName(name: string, isFirst: boolean) {
        if (isFirst) {
            setFirstName(name);
        } else {
            setSecondName(name);
        }
    }

    function saveUid(uid: string, isFirst: boolean) {
        if (isFirst) {
            setFirstUid(uid);
        } else {
            setSecondUid(uid);
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

    async function getReceipts(user: User | null, token: string, year: string, month: string, date: string, shouldPreloadItems: boolean): Promise<IReceipt[]> {
        return await receiptDBService.getReceipts(user, token, year, month, date, shouldPreloadItems);
    }

    async function addReceipt(user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt): Promise<boolean> {
        return await receiptDBService.addReceipt(user, token, year, month, date, receipt);
    }

    async function updateReceipt(user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt): Promise<boolean> {
        return await receiptDBService.updateReceipt(user, token, year, month, date, receipt);
    }

    async function updateReceiptStats(user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt): Promise<IReceipt | undefined> {
        return await receiptDBService.updateReceiptStats(user, token, year, month, date, receipt);
    }

    async function deleteReceipt(user: User | null, token: string, year: string, month: string, date: string, receiptId: string): Promise<boolean> {
        return await receiptDBService.deleteReceipt(user, token, year, month, date, receiptId);
    }

    async function getItems(user: User | null, token: string, year: string, month: string, date: string, receiptId: string): Promise<IReceiptItem[]> {
        return await itemDBService.getItems(user, token, year, month, date, receiptId);
    }

    async function addItemToReceipt(user: User | null, token: string, year: string, month: string, date: string, receiptId: string, item: IReceiptItem): Promise<boolean> {
        return await itemDBService.addReceiptItem(user, token, year, month, date, receiptId, item);
    }

    async function deleteItem(user: User | null, token: string, year: string, month: string, date: string, receiptId: string, itemId: string): Promise<boolean> {
        return await itemDBService.deleteReceiptItem(user, token, year, month, date, receiptId, itemId);
    }

    async function updateItem(user: User | null, token: string, year: string, month: string, date: string, receiptId: string, item: IReceiptItem): Promise<boolean> {
        return await itemDBService.updateReceiptItem(user, token, year, month, date, receiptId, item);
    }

    return <AccountingDataBaseContext.Provider value={{
        firstName,
        secondName,
        firstUid,
        secondUid,
        firstReceipts,
        secondReceipts,
        saveName,
        saveUid,
        saveReceipts,
        generateNewId,
        getReceipts,
        addReceipt,
        deleteReceipt,
        updateReceipt,
        updateReceiptStats,
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