import { createContext, useContext, useRef, useState } from 'react';
import React from 'react';

import * as userDBService from '@/services/fireStores/firebaseUserStore';
import { User } from 'firebase/auth';
import IConnection from '@/interfaces/app/IConnection';
import { IUser } from '@/interfaces/app/IUser';

export interface IUserDataBaseContext {
    selectedConnection: string,
    prevSelectedConnection: string,
    activeConnections: IConnection[],
    saveSelectedConnection: (connection: string) => void,
    savePrevSelectedConnection: (connection: string) => void,
    saveActiveConnections: (connections: IConnection[]) => void,
    addUserToDB: (user: User | null) => Promise<void>,
    addPendingSyncToken: (user: User | null, token: string) => Promise<void>,
    addActiveSyncToken: (user: User | null, token: string) => Promise<boolean>,
    generateNewSyncToken: (user: User | null) => string,
    getActiveConnections: (user: User | null) => Promise<IConnection[]>,
    moveActivePendingTokensToActiveTokens: (user: User | null) => Promise<IConnection[]>,
    hasUserTokenAccess: (user: User | null, token: string) => Promise<boolean>,
    getUserNameByUid: (user: User | null, uid: string) => Promise<string>,
    setUserNameByUid: (user: User | null, uid: string, name: string) => Promise<void>,
    getUserNameByToken: (user: User | null, token: string) => Promise<string>,
    getUserUidByToken: (user: User | null, token: string) => Promise<string>,
}

const defaultValue: IUserDataBaseContext = {
    selectedConnection: '',
    prevSelectedConnection: '',
    activeConnections: [],
    saveSelectedConnection: (connection: string) => { },
    savePrevSelectedConnection: (connection: string) => { },
    saveActiveConnections: (connections: IConnection[]) => [],
    addUserToDB: (user: User | null) => { return new Promise<void>(() => { }); },
    addPendingSyncToken: (user: User | null, token: string) => { return new Promise<void>(() => { }); },
    addActiveSyncToken: (user: User | null, token: string) => { return new Promise<boolean>(() => { }); },
    generateNewSyncToken: (user: User | null) => '',
    getActiveConnections: (user: User | null) => { return new Promise<IConnection[]>(() => { }); },
    moveActivePendingTokensToActiveTokens: (user: User | null) => { return new Promise<IConnection[]>(() => { }); },
    hasUserTokenAccess: (user: User | null, token: string) => { return new Promise<boolean>(() => { }); },
    getUserNameByToken: (user: User | null, token: string) => { return new Promise<string>(() => { }); },
    getUserNameByUid: (user: User | null, uid: string) => { return new Promise<string>(() => { }); },
    setUserNameByUid: (user: User | null, uid: string, name: string) => { return new Promise<void>(() => { }); },
    getUserUidByToken: (user: User | null, token: string) => { return new Promise<string>(() => { }); }

}

const UserDataBaseContext: React.Context<IUserDataBaseContext> = createContext<IUserDataBaseContext>(defaultValue);

const UserDataBaseProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [selectedConnection, setSelectedConnection] = useState('');
    const [prevSelectedConnection, setPrevSelectedConnection] = useState('');
    const [activeConnections, setActiveConnections] = useState<IConnection[]>([]);

    function saveSelectedConnection(connection: string) {
        savePrevSelectedConnection(selectedConnection);
        setSelectedConnection(connection);
    }

    function savePrevSelectedConnection(connection: string) {
        setPrevSelectedConnection(connection);
    }

    function saveActiveConnections(connections: IConnection[]) {
        setActiveConnections(connections);
    }

    async function addUserToDB(user: User | null): Promise<void> {
        return await userDBService.addUserToDB(user);
    }

    async function addPendingSyncToken(user: User | null, token: string): Promise<void> {
        return await userDBService.addPendingSyncToken(user, token);
    }

    async function addActiveSyncToken(user: User | null, token: string): Promise<boolean> {
        return await userDBService.addActiveSyncToken(user, token);
    }

    function generateNewSyncToken(): string {
        return crypto.randomUUID();
    }

    async function getActiveConnections(user: User | null): Promise<IConnection[]> {
        return await userDBService.getActiveConnections(user);
    }

    async function moveActivePendingTokensToActiveTokens(user: User | null): Promise<IConnection[]> {
        return await userDBService.moveActivePendingTokensToActiveTokens(user);
    }

    async function hasUserTokenAccess(user: User | null, token: string): Promise<boolean> {
        return await userDBService.hasUserTokenAccess(user, token);
    }

    async function getUserNameByToken(user: User | null, token: string): Promise<string> {
        return await userDBService.getUserNameByToken(user, token)
    }

    async function getUserNameByUid(user: User | null, uid: string): Promise<string> {
        return await userDBService.getUserNameByUid(user, uid)
    }

    async function setUserNameByUid(user: User | null, uid: string, name: string): Promise<void> {
        return await userDBService.setUserNameByUid(user, uid, name);
    }

    async function getUserUidByToken(user: User | null, token: string): Promise<string> {
        return await userDBService.getUserUidByToken(user, token)
    }

    return <UserDataBaseContext.Provider value={{
        selectedConnection,
        prevSelectedConnection,
        activeConnections,
        saveSelectedConnection,
        savePrevSelectedConnection,
        moveActivePendingTokensToActiveTokens,
        saveActiveConnections,
        addUserToDB,
        addPendingSyncToken,
        addActiveSyncToken,
        generateNewSyncToken,
        getActiveConnections,
        hasUserTokenAccess,
        getUserNameByToken,
        getUserNameByUid,
        setUserNameByUid,
        getUserUidByToken
    }}>{props.children}</UserDataBaseContext.Provider>;
};

export default UserDataBaseProvider;

export const useUserDB = () => {
    return useContext(UserDataBaseContext);
}