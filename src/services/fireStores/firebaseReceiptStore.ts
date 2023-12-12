import { User } from "firebase/auth";
import { DocumentData, DocumentReference, QueryDocumentSnapshot, QuerySnapshot, Timestamp, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import IConnection from "@/interfaces/app/IConnection";
import { IUser } from "@/interfaces/IUser";
import IBill from "@/interfaces/data/IBill";
import moment, { Moment } from "moment";

import * as DataParser from '../../handlers/DataParser';
import firebase_db, { DB_ACCESS_NAMES, getDocumentCollectionData, getDocumentData, isDocumentExisting } from "./firebaseStore";
import { IReceipt } from "@/interfaces/data/IReceipt";

export const receiptConverter = {
    toFirestore: (receipt: IReceipt) => {
        return {
            receiptId: receipt.receiptId,
            payedByUid: receipt.payedByUid,
            store: receipt.store,
            totalPrice: receipt.totalPrice,
            mostCommonCategory: DataParser.getNameOfCategory(receipt.mostCommonCategory),
            amount: receipt.items.length
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();
        const receipt: IReceipt = {
            receiptId: data.receiptId,
            payedByUid: data.payedByUid,
            store: data.store,
            totalPrice: data.totalPrice,
            mostCommonCategory: DataParser.getCategoryByName(data.mostCommonCategory),
            items: []
        }
        return receipt;
    }
};

export async function getReceipts(user: User | null, token: string, date: string): Promise<IReceipt[]> {
    if (user === null || user.displayName === null) { return []; } // TODO: add error
    const receiptCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME, date].join('/');

    return getDocumentCollectionData(receiptCollectionOfConnection, receiptConverter);
}

