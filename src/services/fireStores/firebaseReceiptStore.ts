import { User } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, Timestamp, } from "firebase/firestore";

import { DB_ACCESS_NAMES, addDocument, deleteDocument, getDocumentCollectionData, getDocumentData, updateDocumentData } from "./firebaseStore";
import * as DataParser from '../../handlers/DataParser';
import { IReceipt } from "@/interfaces/data/IReceipt";
import { addReceiptItem, deleteReceiptItem, getItems, itemConverter } from "./firebaseItemStore";
import { IReceiptItem } from "@/interfaces/data/IReceiptItem";
import { Category } from "../../handlers/DataParser";
import { getBill, updateBill } from "./firebaseBillStore";

export const receiptConverter = {
    toFirestore: (receipt: IReceipt) => {
        const mostExpensiveItem = receipt.mostExpensiveItem !== undefined
            ? itemConverter.toFirestore(receipt.mostExpensiveItem)
            : undefined;

        const categoryMetaData = receipt.categoryMetaData.map(metadata => {
            const categoryName = DataParser.getNameOfCategory(metadata.category)
            return {
                category: categoryName === undefined ? metadata.category : categoryName,
                itemAmount: metadata.itemAmount,
                itemEntriesCount: metadata.itemEntriesCount,
                totalPrice: metadata.totalPrice
            }
        });
        const categoryName = DataParser.getNameOfCategory(receipt.mostCommonCategory)

        let dataObj = {
            receiptId: receipt.receiptId,
            payedByUid: receipt.payedByUid,
            store: receipt.store,
            amount: receipt.items === undefined ? 0 : receipt.items.length,
            totalPrice: Math.round(receipt.totalPrice * 100) / 100,
            mostCommonCategory: categoryName === undefined ? receipt.mostCommonCategory : categoryName,
            mostExpensiveItem: mostExpensiveItem,
            categoryMetaData: categoryMetaData,
            needsRefresh: receipt.needsRefresh
        }

        if (dataObj.mostExpensiveItem === undefined) {
            delete dataObj.mostExpensiveItem;
        }

        return dataObj;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();
        const mostExpensiveItem = data.mostExpensiveItem !== undefined
            ? data.mostExpensiveItem as IReceiptItem
            : undefined;

        const categoryMetaData = data.categoryMetaData.map((metadata: any) => {
            return {
                category: DataParser.getCategoryByName(metadata.category),
                itemAmount: metadata.itemAmount,
                itemEntriesCount: metadata.itemEntriesCount,
                totalPrice: metadata.totalPrice
            }
        });

        const receipt: IReceipt = {
            receiptId: data.receiptId,
            payedByUid: data.payedByUid,
            store: data.store,
            amount: data.amount,
            totalPrice: Math.round(data.totalPrice * 100) / 100,
            items: [],
            mostCommonCategory: DataParser.getCategoryByName(data.mostCommonCategory),
            mostExpensiveItem: mostExpensiveItem,
            categoryMetaData: categoryMetaData,
            needsRefresh: data.needsRefresh
        }
        return receipt;
    }
};

export async function getReceipts(user: User | null, token: string, year: string, month: string, date: string, shouldPreLoadItems: boolean): Promise<IReceipt[]> {
    if (user === null || token.length < 36 || date.length < 19) { return []; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');
    const receipts = await getDocumentCollectionData(receiptCollection, receiptConverter) as IReceipt[];

    for (let index = 0; index < receipts.length && shouldPreLoadItems; index++) {
        const receipt = receipts[index];
        if (receipt.amount === 0) { continue; }

        receipt.items = await getItems(user, token, year, month, date, receipt.receiptId);
    }

    return receipts;
}

export async function getReceiptsByUid(user: User | null, token: string, year: string, month: string, date: string, uid: string, shouldPreLoadItems: boolean): Promise<IReceipt[]> {
    if (user === null || token.length < 36 || date.length < 19) { return []; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');
    const receipts = await getDocumentCollectionData(receiptCollection, receiptConverter, 'payedByUid', '==', uid) as IReceipt[];

    for (let index = 0; index < receipts.length && shouldPreLoadItems; index++) {
        const receipt = receipts[index];
        if (receipt.amount === 0) { continue; }

        receipt.items = await getItems(user, token, year, month, date, receipt.receiptId);
    }

    return receipts;
}

export async function getReceipt(user: User | null, token: string, year: string, month: string, date: string, receiptId: string): Promise<IReceipt | undefined> {
    if (user === null || token.length < 36 || date.length < 19) { return undefined; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    const receipt = await getDocumentData(receiptCollection, receiptId, receiptConverter);

    receipt.items = await getItems(user, token, year, month, date, receipt.receiptId);

    return receipt;
}

export async function addReceipt(user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt): Promise<boolean> {
    if (user === null || token.length < 36 || date.length < 19) { return false; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    if (receipt.mostExpensiveItem === undefined) {
        delete receipt.mostExpensiveItem;
    }

    return await addDocument(receiptCollection, receipt.receiptId, receiptConverter, receipt).then(async isUploadSuccess => {
        let isItemUploadSuccess = true;

        for (let index = 0; index < receipt.items.length; index++) {
            const item = receipt.items[index];
            isItemUploadSuccess = isItemUploadSuccess && await addReceiptItem(user, token, year, month, date, receipt.receiptId, item);
        }

        updateReceiptStats(user, token, year, month, date, receipt);

        return isUploadSuccess && isItemUploadSuccess;
    });
}

export async function updateReceipt(user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt): Promise<boolean> {
    if (user === null || token.length < 36 || date.length < 19) { return false; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    if (receipt.mostExpensiveItem === undefined) {
        delete receipt.mostExpensiveItem;
    }

    return await updateDocumentData(receiptCollection, receipt.receiptId, receiptConverter, receipt);
}

export async function updateReceiptStats(user: User | null, token: string, year: string, month: string, date: string, receipt: IReceipt): Promise<IReceipt | undefined> {
    if (user === null || token.length < 36 || date.length < 19) { return undefined; } // TODO: add error
    if (!receipt.needsRefresh) { return receipt } else {
        receipt.needsRefresh = false;
        const currentBill = await getBill(user, token, year, month, date);
        if (currentBill !== undefined) {
            currentBill.needsRefresh = true;
            await updateBill(user, token, year, month, currentBill);
        }
    }
    const updatedReceipt = receipt;

    const items = await getItems(user, token, year, month, date, updatedReceipt.receiptId);

    const categoryMetaData = Object.values(Category).slice((Object.keys(Category).length / 2)).map((category) => {
        return { category: category as Category, itemAmount: 0, itemEntriesCount: 0, totalPrice: 0 };
    })

    updatedReceipt.amount = items.length;
    let totalCost = 0;
    let mostExpensiveItem: IReceiptItem | undefined = undefined;

    items.forEach((item) => {
        if (
            mostExpensiveItem === undefined ||
            (mostExpensiveItem !== undefined && mostExpensiveItem.price < item.price)
        ) {
            mostExpensiveItem = item;
        }

        totalCost += item.price;
        categoryMetaData.filter(category => category.category === item.category)[0].itemAmount += item.amount;
        categoryMetaData.filter(category => category.category === item.category)[0].itemEntriesCount += 1;
        categoryMetaData.filter(category => category.category === item.category)[0].totalPrice += item.price;
    })

    updatedReceipt.totalPrice = Math.round(totalCost * 100) / 100;
    updatedReceipt.mostCommonCategory = categoryMetaData.sort((a, b) => a.itemEntriesCount - b.itemEntriesCount).reverse()[0].category;
    updatedReceipt.mostExpensiveItem = mostExpensiveItem;
    updatedReceipt.categoryMetaData = categoryMetaData;
    updatedReceipt.items = items;

    if (updatedReceipt.mostExpensiveItem === undefined) {
        delete updatedReceipt.mostExpensiveItem;
    }

    return await updateReceipt(user, token, year, month, date, updatedReceipt).then(_ => {
        return updatedReceipt;
    });
}

export async function deleteReceipt(user: User | null, token: string, year: string, month: string, date: string, receiptId: string): Promise<boolean> {
    if (user === null || token.length < 36 || date.length < 19) { return false; } // TODO: add error
    const receiptCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    const itemCollection = [receiptCollection, receiptId, DB_ACCESS_NAMES.ITEMS_DB_NAME].join('/');

    const items = (await getDocumentCollectionData(itemCollection, itemConverter)) as IReceiptItem[];

    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        await deleteReceiptItem(user, token, year, month, date, receiptId, item.itemId);
    }

    return await deleteDocument(receiptCollection, receiptId);
}
