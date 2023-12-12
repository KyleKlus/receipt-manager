import { createContext, useContext, useRef, useState } from 'react';
import React from 'react';

import * as userDBService from '@/services/fireStores/firebaseUserStore';
import * as billDBService from '@/services/fireStores/firebaseBillStore';
import * as dbService from '@/services/fireStores/firebaseStore';
import { User } from 'firebase/auth';
import IBill from '@/interfaces/data/IBill';

export interface IBillDataBaseContext {
    bills: IBill[],
    saveBills: (bills: IBill[]) => void,
    saveCurrentBill: (bill: IBill) => void,
    generateNewId: (user: User | null) => string,
    getBillsByToken: (user: User | null, token: string) => Promise<IBill[]>
    getBillByTokenAndDate: (user: User | null, token: string, date: string) => Promise<IBill | undefined>
    addBill: (user: User | null, token: string) => Promise<string>;
}

const defaultValue: IBillDataBaseContext = {
    bills: [],
    saveBills: (bills: IBill[]) => { },
    saveCurrentBill: (bill: IBill) => { },
    generateNewId: (user: User | null) => '',
    getBillsByToken: (user: User | null, token: string) => { return new Promise<IBill[]>(() => { }); },
    getBillByTokenAndDate: (user: User | null, token: string, date: string) => { return new Promise<IBill | undefined>(() => { }); },
    addBill: (user: User | null, token: string) => { return new Promise<string>(() => { }); }
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

    function generateNewId(): string {
        return crypto.randomUUID().split('-').slice(0, -1).join('-');
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

    return <BillDataBaseContext.Provider value={{
        bills,
        saveBills,
        saveCurrentBill,
        generateNewId,
        getBillsByToken,
        getBillByTokenAndDate,
        addBill,
    }}>{props.children}</BillDataBaseContext.Provider>;
};

export default BillDataBaseProvider;

export const useBillDB = () => {
    return useContext(BillDataBaseContext);
}