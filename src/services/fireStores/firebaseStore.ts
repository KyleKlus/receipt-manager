import firebase_app from "../firebase";
import { collection, connectFirestoreEmulator, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";

const firebase_db = getFirestore(firebase_app);
// connectFirestoreEmulator(firebase_db, '127.0.0.1', 8080); // TODO: remove in prod

interface IDBNames {
    YEARS_DB_NAME: string,
    MONTHS_DB_NAME: string,
    USERS_DB_NAME: string,
    CONNECTION_DB_NAME: string,
    BILLS_DB_NAME: string,
    RECEIPTS_DB_NAME: string,
    ITEMS_DB_NAME: string
}

const testNames: IDBNames = {
    YEARS_DB_NAME: 'test_years',
    MONTHS_DB_NAME: 'test_months',
    USERS_DB_NAME: 'test_users',
    CONNECTION_DB_NAME: 'test_connections',
    BILLS_DB_NAME: 'test_bills',
    RECEIPTS_DB_NAME: 'test_receipts',
    ITEMS_DB_NAME: 'test_items'
}

const productionNames: IDBNames = {
    YEARS_DB_NAME: 'years',
    MONTHS_DB_NAME: 'months',
    USERS_DB_NAME: 'users',
    CONNECTION_DB_NAME: 'connections',
    BILLS_DB_NAME: 'bills',
    RECEIPTS_DB_NAME: 'receipts',
    ITEMS_DB_NAME: 'items'
}

export const DB_ACCESS_NAMES: IDBNames = productionNames;

export async function getDocumentCollectionData(
    documentCollectionName: string,
    dataConverter: any
): Promise<any[]> {
    const docsSnap = await getDocs(collection(firebase_db, documentCollectionName));
    if (docsSnap.size === 0) { return [] }

    const dataArray: any[] = [];
    docsSnap.forEach(doc => {
        dataArray.push(dataConverter.fromFirestore(doc));
    });

    return dataArray;
}

export async function getDocumentData(
    documentCollectionName: string,
    documentName: string,
    dataConverter: any
): Promise<any | undefined> {
    const docRef = doc(firebase_db, documentCollectionName, documentName).withConverter(dataConverter);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) { return undefined }

    const data = docSnap.data();

    return data;
}

export async function addDocument(
    documentCollectionName: string,
    documentName: string,
    dataConverter: any,
    data: any
): Promise<boolean> {
    if (await isDocumentExisting(documentCollectionName, documentName)) {
        return false;
    }

    await setDocumentData(documentCollectionName, documentName, dataConverter, data);
    return true;
}

export async function deleteDocument(
    documentCollectionName: string,
    documentName: string
): Promise<boolean> {
    if (!(await isDocumentExisting(documentCollectionName, documentName))) {
        return false;
    }

    await deleteDoc(doc(firebase_db, documentCollectionName, documentName));
    return true;
}

export async function setDocumentData(
    documentCollectionName: string,
    documentName: string,
    dataConverter: any,
    data: any
): Promise<void> {
    const docRef = doc(firebase_db, documentCollectionName, documentName);

    await setDoc(docRef, dataConverter.toFirestore(data))
}

export async function updateDocumentData(
    documentCollectionName: string,
    documentName: string,
    dataConverter: any,
    data: any
): Promise<boolean> {
    const docRef = doc(firebase_db, documentCollectionName, documentName);

    if (!(await isDocumentExisting(documentCollectionName, documentName))) {
        return false
    }

    await updateDoc(docRef, dataConverter.toFirestore(data));
    return true;
}

export async function isDocumentExisting(
    documentCollectionName: string,
    documentName: string
): Promise<boolean> {
    const docRef = doc(firebase_db, documentCollectionName, documentName);
    const docSnap = await getDoc(docRef);

    return docSnap.exists();
}

export default firebase_db;
