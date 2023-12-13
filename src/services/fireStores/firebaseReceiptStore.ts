import { User } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, } from "firebase/firestore";

import { DB_ACCESS_NAMES, addDocument, deleteDocument, getDocumentCollectionData, getDocumentData, updateDocumentData } from "./firebaseStore";
import * as DataParser from '../../handlers/DataParser';
import { IReceipt } from "@/interfaces/data/IReceipt";
import { deleteReceiptItem, getItems, itemConverter } from "./firebaseItemStore";
import { IReceiptItem } from "@/interfaces/data/IReceiptItem";

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
    if (user === null || token.length < 36 || date.length < 19) { return []; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    const receipts = await getDocumentCollectionData(receiptCollection, receiptConverter) as IReceipt[];

    for (let index = 0; index < receipts.length; index++) {
        const receipt = receipts[index];

        receipt.items = await getItems(user, token, date, receipt.receiptId);
    }

    return receipts;
}

export async function getReceipt(user: User | null, token: string, date: string, receiptId: string): Promise<IReceipt | undefined> {
    if (user === null || token.length < 36 || date.length < 19) { return undefined; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    const receipt = await getDocumentData(receiptCollection, receiptId, receiptConverter);

    receipt.items = await getItems(user, token, date, receipt.receiptId);

    return receipt;
}

export async function addReceipt(user: User | null, token: string, date: string, receipt: IReceipt): Promise<boolean> {
    if (user === null || token.length < 36 || date.length < 19) { return false; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    return await addDocument(receiptCollection, receipt.receiptId, receiptConverter, receipt);
}

export async function updateReceipt(user: User | null, token: string, date: string, receiptId: string, receipt: IReceipt): Promise<boolean> {
    if (user === null || token.length < 36 || date.length < 19) { return false; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    return await updateDocumentData(receiptCollection, receiptId, receiptConverter, receipt);
}

export async function deleteReceipt(user: User | null, token: string, date: string, receiptId: string): Promise<boolean> {
    if (user === null || token.length < 36 || date.length < 19) { return false; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    const itemCollection = [receiptCollection, receiptId, DB_ACCESS_NAMES.ITEMS_DB_NAME].join('/');

    const items = (await getDocumentCollectionData(itemCollection, itemConverter)) as IReceiptItem[];

    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        await deleteReceiptItem(user, token, date, receiptId, item.itemId);
    }

    return await deleteDocument(receiptCollection, receiptId);
}
