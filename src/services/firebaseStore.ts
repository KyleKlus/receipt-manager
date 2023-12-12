import { User } from "firebase/auth";
import firebase_app from "./firebase";
import { DocumentData, DocumentReference, QueryDocumentSnapshot, QuerySnapshot, Timestamp, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import IConnection from "@/interfaces/IConnection";
import { IUser } from "@/interfaces/IUser";
import IBill from "@/interfaces/IBill";
import moment, { Moment } from "moment";

import * as DataParser from '../handlers/DataParser';

const firebase_db = getFirestore(firebase_app);


interface IDBNames {
    USERS_DB_NAME: string,
    CONNECTION_DB_NAME: string,
    BILLS_DB_NAME: string,
    RECEIPTS_DB_NAME: string,
    ITEMS_DB_NAME: string
}

const testNames: IDBNames = {
    USERS_DB_NAME: 'test_users',
    CONNECTION_DB_NAME: 'test_connections',
    BILLS_DB_NAME: 'test_bills',
    RECEIPTS_DB_NAME: 'test_receipts',
    ITEMS_DB_NAME: 'test_items'
}

const productionNames: IDBNames = {
    USERS_DB_NAME: 'users',
    CONNECTION_DB_NAME: 'connections',
    BILLS_DB_NAME: 'bills',
    RECEIPTS_DB_NAME: 'receipts',
    ITEMS_DB_NAME: 'items'
}

export const DB_ACCESS_NAMES: IDBNames = testNames;

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

export const billConverter = {
    toFirestore: (bill: IBill) => {
        const timeStampDate: Timestamp = Timestamp.fromDate(bill.date.toDate());
        return {
            date: timeStampDate,
            mostCommonCategory: DataParser.getNameOfCategory(bill.mostCommonCategory),
            numberOfItems: bill.numberOfItems,
            totalPrice: bill.totalPrice
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();
        const bill: IBill = {
            date: moment(data.date.toDate()),
            mostCommonCategory: DataParser.getCategoryByName(data.mostCommonCategory),
            numberOfItems: data.numberOfItems,
            totalPrice: data.totalPrice
        }
        return bill;
    }
};

export async function addUserToDB(user: User | null): Promise<void> {
    if (user === null || user.displayName === null) { return; } // TODO: add error
    if (await isDocumentExisting(user.uid, DB_ACCESS_NAMES.USERS_DB_NAME)) { return; }

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
    if (!(await isDocumentExisting(token, DB_ACCESS_NAMES.CONNECTION_DB_NAME))) {
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

export async function getBillsByToken(user: User | null, token: string): Promise<IBill[]> {
    if (user === null || user.displayName === null) { return []; } // TODO: add error
    const bills: IBill[] = [];

    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    const billDocsSnap: QuerySnapshot<DocumentData, DocumentData> = await getDocs(collection(firebase_db, billCollectionOfConnection));

    billDocsSnap.docs.forEach(doc => {
        bills.push(billConverter.fromFirestore(doc));
    });

    return bills.reverse();
}

export async function getBillByTokenAndDate(user: User | null, token: string, date: string): Promise<IBill | undefined> {
    if (user === null || user.displayName === null) { return undefined; } // TODO: add error
    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    return await getDocumentData(date, billCollectionOfConnection, billConverter);
}

export async function addBill(user: User | null, token: string): Promise<string> {
    if (user === null || user.displayName === null) { return ''; } // TODO: add error
    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    const newBill: IBill = {
        date: moment(),
        mostCommonCategory: DataParser.Category.None,
        numberOfItems: 0,
        totalPrice: 0
    }

    const billName: string = DataParser.getDateNameByMoment(newBill.date);

    return await setDoc(
        doc(firebase_db, billCollectionOfConnection, billName),
        billConverter.toFirestore(newBill)
    ).then(_ => {
        return billName;
    });
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

        if (await isDocumentExisting(token, DB_ACCESS_NAMES.CONNECTION_DB_NAME)) {
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
    console.log(isTokenInTokenArray(token, userData.activeSyncTokens));

    return isTokenInTokenArray(token, userData.activeSyncTokens);
}

async function getUserDBData(user: User | null): Promise<IUser | undefined> {
    if (user === null || user.displayName === null) { return undefined; } // TODO: add error
    return await getUserDBDataByUid(user.uid);
}

async function getUserDBDataByUid(uid: string): Promise<IUser | undefined> {
    return await getDocumentData(uid, DB_ACCESS_NAMES.USERS_DB_NAME, userConverter) as IUser;
}

async function getConnectionDBDataByToken(token: string): Promise<IConnection | undefined> {
    return await getDocumentData(token, DB_ACCESS_NAMES.CONNECTION_DB_NAME, connectionConverter) as IConnection;
}

async function getDocumentData(
    documentName: string,
    documentCollectionName: string,
    dataConverter: any
): Promise<any> {
    const docRef = doc(firebase_db, documentCollectionName, documentName).withConverter(dataConverter);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) { return undefined }

    const data = docSnap.data();

    return data;
}

async function isDocumentExisting(documentName: string, documentCollectionName: string): Promise<boolean> {
    const docRef = doc(firebase_db, documentCollectionName, documentName);
    const docSnap = await getDoc(docRef);

    return docSnap.exists();
}

export default firebase_db;
