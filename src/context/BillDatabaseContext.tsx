import { createContext, useContext, useRef, useState } from 'react';
import React from 'react';

import * as userDBService from '@/services/fireStores/firebaseUserStore';
import * as billDBService from '@/services/fireStores/firebaseBillStore';
import * as dbService from '@/services/fireStores/firebaseStore';
import { User } from 'firebase/auth';
import IBill from '@/interfaces/data/IBill';

export interface IBillDataBaseContext {
    bills: IBill[],
    currentBill: IBill | undefined,
    saveBills: (bills: IBill[]) => void,
    saveCurrentBill: (bill: IBill) => void,
    getBills: (user: User | null, token: string, year: string, month: string) => Promise<IBill[]>,
    getBill: (user: User | null, token: string, year: string, month: string, date: string) => Promise<IBill | undefined>,
    addBill: (user: User | null, token: string, year: string, month: string) => Promise<string>,
    deleteBill: (user: User | null, token: string, year: string, month: string, bill: IBill) => Promise<boolean>,
    updateBill: (user: User | null, token: string, year: string, month: string, bill: IBill) => Promise<boolean>,
    updateBillStats: (user: User | null, token: string, year: string, month: string, bill: IBill, isFullUpdate: boolean) => Promise<IBill | undefined>
}

const defaultValue: IBillDataBaseContext = {
    bills: [],
    currentBill: undefined,
    saveBills: (bills: IBill[]) => { },
    saveCurrentBill: (bill: IBill) => { },
    getBills: (user: User | null, token: string, year: string, month: string) => { return new Promise<IBill[]>(() => { }); },
    getBill: (user: User | null, token: string, year: string, month: string, date: string) => { return new Promise<IBill | undefined>(() => { }); },
    addBill: (user: User | null, token: string, year: string, month: string) => { return new Promise<string>(() => { }); },
    deleteBill: (user: User | null, token: string, year: string, month: string, bill: IBill) => { return new Promise<boolean>(() => { }); },
    updateBill: (user: User | null, token: string, year: string, month: string, bill: IBill) => { return new Promise<boolean>(() => { }); },
    updateBillStats: (user: User | null, token: string, year: string, month: string, bill: IBill, isFullUpdate: boolean) => { return new Promise<IBill | undefined>(() => { }); }
}

const BillDataBaseContext: React.Context<IBillDataBaseContext> = createContext<IBillDataBaseContext>(defaultValue);

const BillDataBaseProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [bills, setBills] = useState<IBill[]>([]);
    const [currentBill, setCurrentBill] = useState<IBill>();

    function saveBills(bills: IBill[]) {
        setBills(bills);
    }

    function saveCurrentBill(bill: IBill) {
        setCurrentBill(bill);
    }

    async function getBills(user: User | null, token: string, year: string, month: string): Promise<IBill[]> {

        return await billDBService.getBills(user, token, year, month);
    }

    async function getBill(user: User | null, token: string, year: string, month: string, date: string): Promise<IBill | undefined> {
        return await billDBService.getBill(user, token, year, month, date);
    }

    async function addBill(user: User | null, token: string, year: string, month: string): Promise<string> {
        return await billDBService.addBill(user, token, year, month);
    }

    async function deleteBill(user: User | null, token: string, year: string, month: string, bill: IBill): Promise<boolean> {
        return await billDBService.deleteBill(user, token, year, month, bill.name);
    }

    async function updateBill(user: User | null, token: string, year: string, month: string, bill: IBill): Promise<boolean> {
        return await billDBService.updateBill(user, token, year, month, bill);
    }

    async function updateBillStats(user: User | null, token: string, year: string, month: string, bill: IBill, isFullUpdate: boolean): Promise<IBill | undefined> {
        return await billDBService.updateBillStats(user, token, year, month, bill, isFullUpdate);
    }

    return <BillDataBaseContext.Provider value={{
        bills,
        currentBill,
        saveBills,
        saveCurrentBill,
        getBills,
        getBill,
        addBill,
        deleteBill,
        updateBill,
        updateBillStats
    }}>{props.children}</BillDataBaseContext.Provider>;
};

export default BillDataBaseProvider;

export const useBillDB = () => {
    return useContext(BillDataBaseContext);
}