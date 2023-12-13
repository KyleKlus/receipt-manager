import { User } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import IBill from "@/interfaces/data/IBill";
import moment from "moment";

import * as DataParser from '../../handlers/DataParser';
import { DB_ACCESS_NAMES, addDocument, deleteDocument, getDocumentCollectionData, getDocumentData } from "./firebaseStore";
import { deleteReceipt, receiptConverter } from "./firebaseReceiptStore";
import { IReceipt } from "@/interfaces/data/IReceipt";

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
    if (user === null || token.length < 36) { return []; } // TODO: add error

    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');
    return (await getDocumentCollectionData(billCollectionOfConnection, billConverter)).reverse();
}

export async function getBillByTokenAndDate(user: User | null, token: string, date: string): Promise<IBill | undefined> {
    if (user === null || token.length < 36 || date.length < 19) { return undefined; } // TODO: add error
    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    return await getDocumentData(date, billCollectionOfConnection, billConverter);
}

export async function addBill(user: User | null, token: string): Promise<string> {
    if (user === null || token.length < 36) { return ''; } // TODO: add error
    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    const newBill: IBill = {
        date: moment(),
        mostCommonCategory: DataParser.Category.None,
        numberOfItems: 0,
        totalPrice: 0
    }

    const billName: string = DataParser.getDateNameByMoment(newBill.date);

    return await addDocument(billCollectionOfConnection, billName, billConverter, newBill).then(isAdded => {
        if (isAdded) {
            return billName;
        } else {
            return '';
        }
    });
}

export async function deleteBill(user: User | null, token: string, date: string): Promise<boolean> {
    if (user === null || token.length < 36 || date.length < 19) { return false; } // TODO: add error
    const billCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    const receiptCollection = [billCollection, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    const receipts = (await getDocumentCollectionData(receiptCollection, receiptConverter)) as IReceipt[];

    for (let index = 0; index < receipts.length; index++) {
        const receipt = receipts[index];
        await deleteReceipt(user, token, date, receipt.receiptId);
    }

    return await deleteDocument(billCollection, date);
}
