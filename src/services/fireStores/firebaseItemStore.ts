import { User } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, } from "firebase/firestore";

import { DB_ACCESS_NAMES, addDocument, deleteDocument, getDocumentCollectionData, getDocumentData, updateDocumentData } from "./firebaseStore";
import * as DataParser from '../../handlers/DataParser';
import { IReceiptItem } from "@/interfaces/data/IReceiptItem";

export const itemConverter = {
    toFirestore: (item: IReceiptItem) => {
        const categoryName = DataParser.getNameOfCategory(item.category)
        return {
            itemId: item.itemId,
            name: item.name,
            price: Math.round(item.price * 100) / 100,
            amount: item.amount,
            category: categoryName === undefined ? item.category : categoryName,
            ownerUids: item.ownerUids
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();

        const item: IReceiptItem = {
            itemId: data.itemId,
            name: data.name,
            price: Math.round(data.price * 100) / 100,
            amount: data.amount,
            category: DataParser.getCategoryByName(data.category),
            ownerUids: data.ownerUids
        }
        return item;
    }
};

export async function getItems(user: User | null, token: string, year: string, month: string, date: string, receiptId: string): Promise<IReceiptItem[]> {
    if (user === null || user.displayName === null) { return []; } // TODO: add error
    const itemCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME, receiptId, DB_ACCESS_NAMES.ITEMS_DB_NAME].join('/');

    return await getDocumentCollectionData(itemCollectionOfConnection, itemConverter);
}

export async function getReceiptItem(user: User | null, token: string, year: string, month: string, date: string, receiptId: string, itemId: string): Promise<IReceiptItem | undefined> {
    if (user === null || user.displayName === null) { return undefined; } // TODO: add error
    const itemCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME, receiptId, DB_ACCESS_NAMES.ITEMS_DB_NAME].join('/');

    return await getDocumentData(itemCollectionOfConnection, itemId, itemConverter);
}

export async function addReceiptItem(user: User | null, token: string, year: string, month: string, date: string, receiptId: string, item: IReceiptItem): Promise<boolean> {
    if (user === null || user.displayName === null) { return false; } // TODO: add error
    const itemCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME, receiptId, DB_ACCESS_NAMES.ITEMS_DB_NAME].join('/');

    return await addDocument(itemCollectionOfConnection, item.itemId, itemConverter, item);
}

export async function updateReceiptItem(user: User | null, token: string, year: string, month: string, date: string, receiptId: string, item: IReceiptItem): Promise<boolean> {
    if (user === null || user.displayName === null) { return false; } // TODO: add error
    const itemCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME, receiptId, DB_ACCESS_NAMES.ITEMS_DB_NAME].join('/');

    return await updateDocumentData(itemCollectionOfConnection, item.itemId, itemConverter, item);
}

export async function deleteReceiptItem(user: User | null, token: string, year: string, month: string, date: string, receiptId: string, itemId: string): Promise<boolean> {
    if (user === null || user.displayName === null) { return false; } // TODO: add error
    const itemCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME, receiptId, DB_ACCESS_NAMES.ITEMS_DB_NAME].join('/');

    return await deleteDocument(itemCollectionOfConnection, itemId);
}
