import { User } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import IBill from "@/interfaces/data/IBill";
import moment from "moment";

import * as DataParser from '../../handlers/DataParser';
import { DB_ACCESS_NAMES, addDocument, deleteDocument, getDocumentCollectionData, getDocumentData, updateDocumentData } from "./firebaseStore";
import { deleteReceipt, getReceipts, receiptConverter, updateReceiptStats } from "./firebaseReceiptStore";
import { IReceipt } from "@/interfaces/data/IReceipt";
import { Category } from "../../handlers/DataParser";

export const billConverter = {
    toFirestore: (bill: IBill) => {
        const timeStampDate: Timestamp = Timestamp.fromDate(bill.date.toDate());
        return {
            date: timeStampDate,
            name: bill.name,
            mostCommonCategory: DataParser.getNameOfCategory(bill.mostCommonCategory),
            numberOfItems: bill.numberOfItems,
            totalPrice: Math.round(bill.totalPrice * 100) / 100
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();
        const bill: IBill = {
            date: moment(data.date.toDate()),
            name: data.name,
            mostCommonCategory: DataParser.getCategoryByName(data.mostCommonCategory),
            numberOfItems: data.numberOfItems,
            totalPrice: Math.round(data.totalPrice * 100) / 100
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

    return await getDocumentData(billCollectionOfConnection, date, billConverter);
}

export async function addBill(user: User | null, token: string): Promise<string> {
    if (user === null || token.length < 36) { return ''; } // TODO: add error
    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    const date = moment();

    const newBill: IBill = {
        name: DataParser.getDateNameByMoment(date),
        date: date,
        mostCommonCategory: DataParser.Category.None,
        numberOfItems: 0,
        totalPrice: 0
    }


    return await addDocument(billCollectionOfConnection, newBill.name, billConverter, newBill).then(isAdded => {
        if (isAdded) {
            return newBill.name;
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

export async function updateBill(user: User | null, token: string, bill: IBill): Promise<boolean> {
    if (user === null || user.displayName === null) { return false; } // TODO: add error
    const billCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    return await updateDocumentData(billCollection, DataParser.getDateNameByMoment(bill.date), billConverter, bill);
}

export async function updateBillStats(user: User | null, token: string, bill: IBill, isFullUpdate: boolean): Promise<IBill | undefined> {
    if (user === null || user.displayName === null) { return undefined; } // TODO: add error
    const billCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    const updatedBill = bill;

    const receipts = await getReceipts(user, token, updatedBill.name);

    const categoryCounter = Object.values(Category).slice((Object.keys(Category).length / 2)).map((category) => {
        return { category: category, amount: 0 };
    })

    updatedBill.numberOfItems = receipts.length;

    let totalCost = 0;

    for (let index = 0; index < receipts.length; index++) {
        let receipt = receipts[index];
        if (isFullUpdate) {
            const updatedReceipt = await updateReceiptStats(user, token, updatedBill.name, receipt);
            if (updatedReceipt !== undefined) {
                receipt = updatedReceipt;
            }
        }

        totalCost += receipt.totalPrice;
        categoryCounter[receipt.mostCommonCategory].amount += 1;
    }

    updatedBill.totalPrice = Math.round(totalCost * 100) / 100;
    updatedBill.mostCommonCategory = categoryCounter.sort((a, b) => a.amount - b.amount).reverse()[0].category as Category

    return await updateDocumentData(billCollection, DataParser.getDateNameByMoment(updatedBill.date), billConverter, updatedBill).then(isSuccessful => {
        return isSuccessful ? updatedBill : undefined
    });
}
