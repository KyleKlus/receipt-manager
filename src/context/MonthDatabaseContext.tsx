import { createContext, useContext, useRef, useState } from 'react';
import React from 'react';

import * as userDBService from '@/services/fireStores/firebaseUserStore';
import * as monthDBService from '@/services/fireStores/firebaseMonthStore';
import * as dbService from '@/services/fireStores/firebaseStore';
import { User } from 'firebase/auth';
import IMonth from '@/interfaces/data/IMonth';

export interface IMonthDataBaseContext {
    months: IMonth[],
    currentMonth: IMonth | undefined,
    saveMonths: (months: IMonth[]) => void,
    saveCurrentMonth: (month: IMonth) => void,
    getMonths: (user: User | null, token: string, year: string) => Promise<IMonth[]>,
    getMonth: (user: User | null, token: string, year: string, month: string) => Promise<IMonth | undefined>,
    addMonth: (user: User | null, token: string, year: string) => Promise<IMonth | undefined>,
    updateMonth: (user: User | null, token: string, year: string, month: IMonth) => Promise<boolean>,
    updateMonthStats: (user: User | null, token: string, year: string, month: IMonth, isFullUpdate: boolean) => Promise<IMonth | undefined>
}

const defaultValue: IMonthDataBaseContext = {
    months: [],
    currentMonth: undefined,
    saveMonths: (months: IMonth[]) => { },
    saveCurrentMonth: (month: IMonth) => { },
    getMonths: (user: User | null, token: string, year: string) => { return new Promise<IMonth[]>(() => { }); },
    getMonth: (user: User | null, token: string, year: string, month: string) => { return new Promise<IMonth | undefined>(() => { }); },
    addMonth: (user: User | null, token: string, year: string) => { return new Promise<IMonth | undefined>(() => { }); },
    updateMonth: (user: User | null, token: string, year: string, month: IMonth) => { return new Promise<boolean>(() => { }); },
    updateMonthStats: (user: User | null, token: string, year: string, month: IMonth, isFullUpdate: boolean) => { return new Promise<IMonth | undefined>(() => { }); }
}

const MonthDataBaseContext: React.Context<IMonthDataBaseContext> = createContext<IMonthDataBaseContext>(defaultValue);

const MonthDataBaseProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [months, setMonths] = useState<IMonth[]>([]);
    const [currentMonth, setCurrentMonth] = useState<IMonth>();

    function saveMonths(months: IMonth[]) {
        setMonths(months);
    }

    function saveCurrentMonth(month: IMonth) {
        setCurrentMonth(month);
    }

    async function getMonths(user: User | null, token: string, year: string): Promise<IMonth[]> {
        return await monthDBService.getMonths(user, token, year);
    }

    async function getMonth(user: User | null, token: string, year: string, month: string): Promise<IMonth | undefined> {
        return await monthDBService.getMonth(user, token, year, month);
    }

    async function addMonth(user: User | null, token: string, year: string): Promise<IMonth | undefined> {
        return await monthDBService.addMonth(user, token, year);
    }


    async function updateMonth(user: User | null, token: string, year: string, month: IMonth): Promise<boolean> {
        return await monthDBService.updateMonth(user, token, year, month);
    }

    async function updateMonthStats(user: User | null, token: string, year: string, month: IMonth, isFullUpdate: boolean): Promise<IMonth | undefined> {
        return await monthDBService.updateMonthStats(user, token, year, month, isFullUpdate);
    }

    return <MonthDataBaseContext.Provider value={{
        months,
        currentMonth,
        saveMonths,
        saveCurrentMonth,
        getMonths,
        getMonth,
        addMonth,
        updateMonth,
        updateMonthStats
    }}>{props.children}</MonthDataBaseContext.Provider>;
};

export default MonthDataBaseProvider;

export const useMonthDB = () => {
    return useContext(MonthDataBaseContext);
}