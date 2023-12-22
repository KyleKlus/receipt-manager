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
    getBillsByToken: (user: User | null, token: string) => Promise<IBill[]>,
    getBillByTokenAndDate: (user: User | null, token: string, date: string) => Promise<IBill | undefined>,
    addBill: (user: User | null, token: string) => Promise<string>,
    updateBill: (user: User | null, token: string, bill: IBill) => Promise<boolean>,
    updateBillStats: (user: User | null, token: string, bill: IBill, isFullUpdate: boolean) => Promise<IBill | undefined>
}

const defaultValue: IBillDataBaseContext = {
    bills: [],
    currentBill: undefined,
    saveBills: (bills: IBill[]) => { },
    saveCurrentBill: (bill: IBill) => { },
    getBillsByToken: (user: User | null, token: string) => { return new Promise<IBill[]>(() => { }); },
    getBillByTokenAndDate: (user: User | null, token: string, date: string) => { return new Promise<IBill | undefined>(() => { }); },
    addBill: (user: User | null, token: string) => { return new Promise<string>(() => { }); },
    updateBill: (user: User | null, token: string, bill: IBill) => { return new Promise<boolean>(() => { }); },
    updateBillStats: (user: User | null, token: string, bill: IBill, isFullUpdate: boolean) => { return new Promise<IBill | undefined>(() => { }); }
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

    async function getBillsByToken(user: User | null, token: string): Promise<IBill[]> {
        return await billDBService.getBillsByToken(user, token);
    }

    async function getBillByTokenAndDate(user: User | null, token: string, date: string): Promise<IBill | undefined> {
        return await billDBService.getBillByTokenAndDate(user, token, date);
    }

    async function addBill(user: User | null, token: string): Promise<string> {
        return await billDBService.addBill(user, token);
    }


    async function updateBill(user: User | null, token: string, bill: IBill): Promise<boolean> {
        return await billDBService.updateBill(user, token, bill);
    }

    async function updateBillStats(user: User | null, token: string, bill: IBill, isFullUpdate: boolean): Promise<IBill | undefined> {
        return await billDBService.updateBillStats(user, token, bill, isFullUpdate);
    }

    return <BillDataBaseContext.Provider value={{
        bills,
        currentBill,
        saveBills,
        saveCurrentBill,
        getBillsByToken,
        getBillByTokenAndDate,
        addBill,
        updateBill,
        updateBillStats
    }}>{props.children}</BillDataBaseContext.Provider>;
};

export default BillDataBaseProvider;

export const useBillDB = () => {
    return useContext(BillDataBaseContext);
}