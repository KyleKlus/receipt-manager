import { createContext, useContext, useRef, useState } from 'react';
import React from 'react';

import * as userDBService from '@/services/fireStores/firebaseUserStore';
import * as yearDBService from '@/services/fireStores/firebaseYearStore';
import * as dbService from '@/services/fireStores/firebaseStore';
import { User } from 'firebase/auth';
import IYear from '@/interfaces/data/IYear';

export interface IYearDataBaseContext {
    years: IYear[],
    currentYear: IYear | undefined,
    saveYears: (years: IYear[]) => void,
    saveCurrentYear: (year: IYear) => void,
    getYears: (user: User | null, token: string) => Promise<IYear[]>,
    getYear: (user: User | null, token: string, year: string) => Promise<IYear | undefined>,
    addYear: (user: User | null, token: string) => Promise<IYear| undefined>,
    updateYear: (user: User | null, token: string, year: IYear) => Promise<boolean>,
    updateYearStats: (user: User | null, token: string, year: IYear, isFullUpdate: boolean) => Promise<IYear | undefined>
}

const defaultValue: IYearDataBaseContext = {
    years: [],
    currentYear: undefined,
    saveYears: (years: IYear[]) => { },
    saveCurrentYear: (year: IYear) => { },
    getYears: (user: User | null, token: string) => { return new Promise<IYear[]>(() => { }); },
    getYear: (user: User | null, token: string, year: string) => { return new Promise<IYear | undefined>(() => { }); },
    addYear: (user: User | null, token: string) => { return new Promise<IYear| undefined>(() => { }); },
    updateYear: (user: User | null, token: string,year: IYear) => { return new Promise<boolean>(() => { }); },
    updateYearStats: (user: User | null, token: string, year: IYear, isFullUpdate: boolean) => { return new Promise<IYear | undefined>(() => { }); }
}

const YearDataBaseContext: React.Context<IYearDataBaseContext> = createContext<IYearDataBaseContext>(defaultValue);

const YearDataBaseProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [years, setYears] = useState<IYear[]>([]);
    const [currentYear, setCurrentYear] = useState<IYear>();

    function saveYears(years: IYear[]) {
        setYears(years);
    }

    function saveCurrentYear(year: IYear) {
        setCurrentYear(year);
    }

    async function getYears(user: User | null, token: string): Promise<IYear[]> {
        return await yearDBService.getYears(user, token);
    }

    async function getYear(user: User | null, token: string, year: string): Promise<IYear | undefined> {
        return await yearDBService.getYear(user, token, year);
    }

    async function addYear(user: User | null, token: string): Promise<IYear| undefined> {
        return await yearDBService.addYear(user, token);
    }


    async function updateYear(user: User | null, token: string, year: IYear): Promise<boolean> {
        return await yearDBService.updateYear(user, token, year);
    }

    async function updateYearStats(user: User | null, token: string,  year: IYear, isFullUpdate: boolean): Promise<IYear | undefined> {
        return await yearDBService.updateYearStats(user, token, year, isFullUpdate);
    }

    return <YearDataBaseContext.Provider value={{
        years,
        currentYear,
        saveYears,
        saveCurrentYear,
        getYears,
        getYear,
        addYear,
        updateYear,
        updateYearStats
    }}>{props.children}</YearDataBaseContext.Provider>;
};

export default YearDataBaseProvider;

export const useYearDB = () => {
    return useContext(YearDataBaseContext);
}