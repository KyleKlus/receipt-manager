import { User } from "firebase/auth";
import { DocumentData, DocumentReference, QueryDocumentSnapshot, QuerySnapshot, Timestamp, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import IConnection from "@/interfaces/app/IConnection";
import { IUser } from "@/interfaces/app/IUser";
import IBill from "@/interfaces/data/IBill";
import moment, { Moment } from "moment";

import * as DataParser from '../../handlers/DataParser';
import firebase_db, { DB_ACCESS_NAMES, getDocumentData, isDocumentExisting } from "./firebaseStore";

export const userConverter = {
    toFirestore: (user: IUser) => {
        return {
            name: user.name,
            uid: user.uid,
            pendingSyncTokens: user.pendingSyncTokens,
            activeSyncTokens: user.activeSyncTokens,
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();
        const user: IUser = {
            name: data.name,
            pendingSyncTokens: data.pendingSyncTokens,
            activeSyncTokens: data.activeSyncTokens,
            uid: data.uid
        }
        return user;
    }
};

export const connectionConverter = {
    toFirestore: (connection: IConnection) => {
        return {
            name: connection.name,
            token: connection.token
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();
        const connection: IConnection = {
            name: data.name,
            token: data.token
        }
        return connection;
    }
};

export async function addUserToDB(user: User | null): Promise<void> {
    if (user === null || user.displayName === null) { return; } // TODO: add error
    if (await isDocumentExisting(DB_ACCESS_NAMES.USERS_DB_NAME, user.uid)) { return; }

    const newUser: IUser = {
        name: user.displayName,
        pendingSyncTokens: [],
        activeSyncTokens: [],
        uid: user.uid
    }

    await setDoc(doc(firebase_db, DB_ACCESS_NAMES.USERS_DB_NAME, user.uid), newUser);
}

export async function addPendingSyncToken(user: User | null, token: string): Promise<void> {
    if (user === null || user.displayName === null || token.length < 1) { return; } // TODO: add error

    const userData = await getUserDBDataByUid(user.uid);
    if (userData === undefined) { return } // TODO: add error

    const pendingSyncTokens: string[] = userData.pendingSyncTokens;
    pendingSyncTokens.push(token);

    await updateDoc(doc(firebase_db, DB_ACCESS_NAMES.USERS_DB_NAME, user.uid), { pendingSyncTokens: pendingSyncTokens });
}

export async function addActiveSyncToken(user: User | null, token: string): Promise<boolean> {
    if (user === null || user.displayName === null || token.length !== 36) { return false; } // TODO: add error
    const userData = await getUserDBDataByUid(user.uid);
    if (userData === undefined) { return false; } // TODO: add error

    let pendingSyncTokens: string[] = userData.pendingSyncTokens;
    const activeSyncTokens: string[] = userData.activeSyncTokens;

    // Block putting own pending tokens into active tokens
    if (isTokenInTokenArray(token, pendingSyncTokens)) { return false; }
    activeSyncTokens.push(token);

    // Create the doc for the token if it doesn't exist
    if (!(await isDocumentExisting(DB_ACCESS_NAMES.CONNECTION_DB_NAME, token))) {
        await setDoc(doc(firebase_db, DB_ACCESS_NAMES.CONNECTION_DB_NAME, token), {
            name: `connection-${token.split('-')[0]}`,
            token: token
        })
    }

    return await updateDoc(doc(firebase_db, DB_ACCESS_NAMES.USERS_DB_NAME, user.uid), {
        activeSyncTokens: activeSyncTokens
    }).then(_ => {
        return true;
    });
}

export async function getActiveConnections(user: User | null): Promise<IConnection[]> {
    if (user === null || user.displayName === null) { return []; } // TODO: add error

    const userData = await getUserDBDataByUid(user.uid);
    if (userData === undefined) { return []; }

    const myActivatedTokens: string[] = userData.activeSyncTokens;
    const activeConnections: IConnection[] = [];

    for (let index: number = 0; index < myActivatedTokens.length; index++) {
        const token = myActivatedTokens[index];

        if (token.length < 36) { throw Error('One token in the activated tokens array of the user: ' + user.displayName + ' ' + user.uid + ' is invalid') }

        const connectionData = await getConnectionDBDataByToken(token);

        if (connectionData !== undefined) {
            activeConnections.push(connectionData);
        }
    }

    return await activeConnections;
}

function isTokenInTokenArray(token: string, tokenArray: string[]): boolean {
    return tokenArray.length > 0 &&
        tokenArray.filter(arrayToken => arrayToken === token).length !== 0;
}

export async function moveActivePendingTokensToActiveTokens(
    user: User | null
): Promise<IConnection[]> {
    if (user === null || user.displayName === null) { return []; } // TODO: add error
    const userData = await getUserDBDataByUid(user.uid);
    if (userData === undefined) { return []; }
    let myPendingSyncTokens: string[] = userData.pendingSyncTokens;
    let myActivatedSyncTokens: string[] = userData.activeSyncTokens;

    const activatedSyncTokens: string[] = [];

    for (let index: number = 0; index < myPendingSyncTokens.length; index++) {
        const token = myPendingSyncTokens[index];
        if (token.length < 36) { throw Error('One token in the activated tokens array of the user: ' + user.displayName + ' ' + user.uid + ' is invalid') }

        if (await isDocumentExisting(DB_ACCESS_NAMES.CONNECTION_DB_NAME, token)) {
            activatedSyncTokens.push(token);
            myActivatedSyncTokens.push(token);
        }
    }

    // Remove activated tokens
    for (let index: number = 0; index < activatedSyncTokens.length; index++) {
        const token = activatedSyncTokens[index];
        myPendingSyncTokens = myPendingSyncTokens.filter(pendingSyncToken => pendingSyncToken !== token);
    }

    await updateDoc(
        doc(firebase_db, DB_ACCESS_NAMES.USERS_DB_NAME, user.uid),
        { activeSyncTokens: myActivatedSyncTokens, pendingSyncTokens: myPendingSyncTokens });

    const activatedConnections: IConnection[] = [];
    for (let index: number = 0; index < activatedSyncTokens.length; index++) {
        const token = activatedSyncTokens[index];

        if (token.length < 36) { throw Error('One token in the activated tokens array of the user: ' + user.displayName + ' ' + user.uid + ' is invalid') }

        const connectionData = await getConnectionDBDataByToken(token);

        if (connectionData !== undefined) {
            activatedConnections.push(connectionData);
        }
    }

    return activatedConnections;
}

export async function hasUserTokenAccess(user: User | null, token: string): Promise<boolean> {
    if (user === null || token.length < 36) { return false; }
    const userData: IUser | undefined = await getUserDBDataByUid(user.uid);
    if (userData === undefined) {
        return false;
    }

    return isTokenInTokenArray(token, userData.activeSyncTokens);
}

export async function getUserNameByToken(user: User | null, token: string): Promise<string> {
    if (user === null || token.length < 36) { return ''; }

    let userName: string = '';
    const userDocsSnap = (await getDocs(collection(firebase_db, DB_ACCESS_NAMES.USERS_DB_NAME)));

    userDocsSnap.forEach(doc => {
        const userData = doc.data();

        if ((isTokenInTokenArray(token, userData.activeSyncTokens) || isTokenInTokenArray(token, userData.pendingSyncTokens)) && userData.uid !== user.uid) {
            userName = userData.name;

            return userName
        }
    })

    return userName;
}

export async function getUserUidByToken(user: User | null, token: string): Promise<string> {
    if (user === null || token.length < 36) { return ''; }

    let uid: string = '';
    const userDocsSnap = (await getDocs(collection(firebase_db, DB_ACCESS_NAMES.USERS_DB_NAME)));

    userDocsSnap.forEach(doc => {
        const userData = doc.data();

        if ((isTokenInTokenArray(token, userData.activeSyncTokens) || isTokenInTokenArray(token, userData.pendingSyncTokens)) && userData.uid !== user.uid) {
            uid = userData.uid;
            return uid
        }
    })

    return uid;
}


async function getUserDBData(user: User | null): Promise<IUser | undefined> {
    if (user === null || user.displayName === null) { return undefined; } // TODO: add error
    return await getUserDBDataByUid(user.uid);
}

async function getUserDBDataByUid(uid: string): Promise<IUser | undefined> {
    return await getDocumentData(DB_ACCESS_NAMES.USERS_DB_NAME, uid, userConverter) as IUser;
}

async function getConnectionDBDataByToken(token: string): Promise<IConnection | undefined> {
    return await getDocumentData(DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, connectionConverter) as IConnection;
}
