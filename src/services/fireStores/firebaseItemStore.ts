import { User } from "firebase/auth";
import { DocumentData, DocumentReference, QueryDocumentSnapshot, QuerySnapshot, Timestamp, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import IConnection from "@/interfaces/app/IConnection";
import { IUser } from "@/interfaces/IUser";
import IBill from "@/interfaces/data/IBill";
import moment, { Moment } from "moment";

import * as DataParser from '../../handlers/DataParser';
import firebase_db, { DB_ACCESS_NAMES, getDocumentData, isDocumentExisting } from "./firebaseStore";

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
