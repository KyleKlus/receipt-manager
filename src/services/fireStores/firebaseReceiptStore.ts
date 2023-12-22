import { User } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, Timestamp, } from "firebase/firestore";

import { DB_ACCESS_NAMES, addDocument, deleteDocument, getDocumentCollectionData, getDocumentData, updateDocumentData } from "./firebaseStore";
import * as DataParser from '../../handlers/DataParser';
import { IReceipt } from "@/interfaces/data/IReceipt";
import { addReceiptItem, deleteReceiptItem, getItems, itemConverter } from "./firebaseItemStore";
import { IReceiptItem } from "@/interfaces/data/IReceiptItem";
import moment from "moment";
import { getBillByTokenAndDate, updateBill } from "./firebaseBillStore";
import { Category } from "../../handlers/DataParser";

export const receiptConverter = {
    toFirestore: (receipt: IReceipt) => {
        return {
            receiptId: receipt.receiptId,
            payedByUid: receipt.payedByUid,
            store: receipt.store,
            totalPrice: Math.round(receipt.totalPrice * 100) / 100,
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
            totalPrice: Math.round(data.totalPrice * 100) / 100,
            mostCommonCategory: DataParser.getCategoryByName(data.mostCommonCategory),
            amount: data.amount,
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


    return await addDocument(receiptCollection, receipt.receiptId, receiptConverter, receipt).then(async isUploadSuccess => {
        let isItemUploadSuccess = true;

        for (let index = 0; index < receipt.items.length; index++) {
            const item = receipt.items[index];
            isItemUploadSuccess = isItemUploadSuccess && await addReceiptItem(user, token, date, receipt.receiptId, item);
        }

        updateReceiptStats(user, token, date, receipt);

        return isUploadSuccess && isItemUploadSuccess;
    });
}

export async function updateReceipt(user: User | null, token: string, date: string, receipt: IReceipt): Promise<boolean> {
    if (user === null || token.length < 36 || date.length < 19) { return false; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    return await updateDocumentData(receiptCollection, receipt.receiptId, receiptConverter, receipt);
}

export async function updateReceiptStats(user: User | null, token: string, date: string, receipt: IReceipt): Promise<IReceipt | undefined> {
    if (user === null || token.length < 36 || date.length < 19) { return undefined; } // TODO: add error
    const updatedReceipt = receipt;

    const items = await getItems(user, token, date, updatedReceipt.receiptId);
    const categoryCounter = Object.values(Category).slice((Object.keys(Category).length / 2)).map((category) => {
        return { category: category, amount: 0 };
    })
    updatedReceipt.amount = items.length;
    let totalCost = 0;

    items.forEach((item) => {
        totalCost += item.price;
        categoryCounter[item.category].amount += 1;
    })

    updatedReceipt.totalPrice = Math.round(totalCost * 100) / 100;
    updatedReceipt.mostCommonCategory = categoryCounter.sort((a, b) => a.amount - b.amount).reverse()[0].category as Category;
    updatedReceipt.items = items;
    return await updateReceipt(user, token, date, updatedReceipt).then(_ => {
        return updatedReceipt;
    });
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
