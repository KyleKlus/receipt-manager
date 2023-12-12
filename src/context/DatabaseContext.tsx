import { createContext, useContext, useRef, useState } from 'react';
import React from 'react';

import * as dbService from '@/services/firebaseStore';
import { User } from 'firebase/auth';
import IConnection from '@/interfaces/IConnection';
import IBill from '@/interfaces/IBill';

export interface IDataBaseContext {
    selectedConnection: string,
    activeConnections: IConnection[],
    bills: IBill[],
    saveSelectedConnection: (connection: string) => void,
    saveActiveConnections: (connections: IConnection[]) => void,
    saveBills: (bills: IBill[]) => void,
    addUserToDB: (user: User | null) => Promise<void>,
    addPendingSyncToken: (user: User | null, token: string) => Promise<void>,
    addActiveSyncToken: (user: User | null, token: string) => Promise<boolean>,
    generateNewSyncToken: (user: User | null) => string,
    getActiveConnections: (user: User | null) => Promise<IConnection[]>,
    moveActivePendingTokensToActiveTokens: (user: User | null) => Promise<IConnection[]>,
    getBillsByToken: (user: User | null, token: string) => Promise<IBill[]>
    addBill: (user: User | null, token: string) => Promise<string>;
    hasUserTokenAccess: (user: User | null, token: string) => Promise<boolean>,
}

const defaultValue: IDataBaseContext = {
    selectedConnection: '',
    activeConnections: [],
    bills: [],
    saveSelectedConnection: (connection: string) => { },
    saveActiveConnections: (connections: IConnection[]) => [],
    saveBills: (bills: IBill[]) => { },
    addUserToDB: (user: User | null) => { return new Promise<void>(() => { }); },
    addPendingSyncToken: (user: User | null, token: string) => { return new Promise<void>(() => { }); },
    addActiveSyncToken: (user: User | null, token: string) => { return new Promise<boolean>(() => { }); },
    generateNewSyncToken: (user: User | null) => '',
    getActiveConnections: (user: User | null) => { return new Promise<IConnection[]>(() => { }); },
    moveActivePendingTokensToActiveTokens: (user: User | null) => { return new Promise<IConnection[]>(() => { }); },
    getBillsByToken: (user: User | null, token: string) => { return new Promise<IBill[]>(() => { }); },
    addBill: (user: User | null, token: string) => { return new Promise<string>(() => { }); },
    hasUserTokenAccess: (user: User | null, token: string) => { return new Promise<boolean>(() => { }); }
}

const DataBaseContext: React.Context<IDataBaseContext> = createContext<IDataBaseContext>(defaultValue);

const DataBaseProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [selectedConnection, setSelectedConnection] = useState('');
    const [activeConnections, setActiveConnections] = useState<IConnection[]>([]);
    const [bills, setBills] = useState<IBill[]>([]);
    // const [bills, setBills] = useState<[]>([]);

    function saveSelectedConnection(connection: string) {
        setSelectedConnection(connection);
    }

    function saveActiveConnections(connections: IConnection[]) {
        setActiveConnections(connections);
    }

    function saveBills(bills: IBill[]) {
        setBills(bills);
    }

    async function addUserToDB(user: User | null): Promise<void> {
        return await dbService.addUserToDB(user);
    }

    async function addPendingSyncToken(user: User | null, token: string): Promise<void> {
        return await dbService.addPendingSyncToken(user, token);
    }

    async function addActiveSyncToken(user: User | null, token: string): Promise<boolean> {
        return await dbService.addActiveSyncToken(user, token);
    }

    function generateNewSyncToken(): string {
        return crypto.randomUUID();
    }

    async function getActiveConnections(user: User | null): Promise<IConnection[]> {
        return await dbService.getActiveConnections(user);
    }

    async function moveActivePendingTokensToActiveTokens(user: User | null): Promise<IConnection[]> {
        return await dbService.moveActivePendingTokensToActiveTokens(user);
    }

    async function getBillsByToken(user: User | null, token: string): Promise<IBill[]> {
        return await dbService.getBillsByToken(user, token);
    }

    async function addBill(user: User | null, token: string): Promise<string> {
        return await dbService.addBill(user, token);
    }

    async function hasUserTokenAccess(user: User | null, token: string): Promise<boolean> {
        return await dbService.hasUserTokenAccess(user, token);
    }

    return <DataBaseContext.Provider value={{
        selectedConnection,
        activeConnections,
        bills,
        saveSelectedConnection,
        moveActivePendingTokensToActiveTokens,
        saveBills,
        saveActiveConnections,
        addUserToDB,
        addPendingSyncToken,
        addActiveSyncToken,
        generateNewSyncToken,
        getActiveConnections,
        getBillsByToken,
        addBill,
        hasUserTokenAccess
    }}>{props.children}</DataBaseContext.Provider>;
};

export default DataBaseProvider;

export const useDB = () => {
    return useContext(DataBaseContext);
}