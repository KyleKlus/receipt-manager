import { User } from "firebase/auth";
import firebase_app from "../firebase";
import { DocumentData, DocumentReference, QueryDocumentSnapshot, QuerySnapshot, Timestamp, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import IConnection from "@/interfaces/app/IConnection";
import { IUser } from "@/interfaces/IUser";
import IBill from "@/interfaces/data/IBill";
import moment, { Moment } from "moment";

import * as DataParser from '../../handlers/DataParser';

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

export async function getDocumentCollectionData(
    documentCollectionName: string,
    dataConverter: any
): Promise<any[]> {
    const docsSnap = await getDocs(collection(firebase_db, documentCollectionName));

    const dataArray: any[] = [];

    docsSnap.forEach(doc => {
        dataArray.push(dataConverter.fromFirestore(doc));
    })

    return dataArray;
}

export async function getDocumentData(
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

export async function setDocumentData(
    documentName: string,
    documentCollectionName: string,
    dataConverter: any,
    data: any
): Promise<void> {
    const docRef = doc(firebase_db, documentCollectionName, documentName);

    await setDoc(docRef, dataConverter.toFirestore(data))
}

export async function updateDocumentData(
    documentName: string,
    documentCollectionName: string,
    dataConverter: any,
    data: any
): Promise<boolean> {
    const docRef = doc(firebase_db, documentCollectionName, documentName);

    if (!(await isDocumentExisting(documentName, documentCollectionName))) {
        return false
    }

    await updateDoc(docRef, dataConverter.toFirestore(data));
    return true;
}

export async function isDocumentExisting(documentName: string, documentCollectionName: string): Promise<boolean> {
    const docRef = doc(firebase_db, documentCollectionName, documentName);
    const docSnap = await getDoc(docRef);

    return docSnap.exists();
}

export default firebase_db;
