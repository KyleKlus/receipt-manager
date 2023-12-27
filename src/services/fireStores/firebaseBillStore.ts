import { User } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import IBill from "@/interfaces/data/IBill";
import moment from "moment";

import * as DataParser from '../../handlers/DataParser';
import { DB_ACCESS_NAMES, addDocument, deleteDocument, getDocumentCollectionData, getDocumentData, updateDocumentData } from "./firebaseStore";
import { deleteReceipt, getReceipts, receiptConverter, updateReceiptStats } from "./firebaseReceiptStore";
import { IReceipt } from "@/interfaces/data/IReceipt";
import { Category } from "../../handlers/DataParser";
import { itemConverter } from "./firebaseItemStore";
import { IReceiptItem } from "@/interfaces/data/IReceiptItem";
import { getMonth, updateMonth } from "./firebaseMonthStore";

export const billConverter = {
    toFirestore: (bill: IBill) => {
        const timeStampDate: Timestamp = Timestamp.fromDate(bill.date.toDate());

        const mostExpensiveItem = bill.mostExpensiveItem !== undefined
            ? itemConverter.toFirestore(bill.mostExpensiveItem)
            : undefined;

        const mostExpensiveReceipt = bill.mostExpensiveReceipt !== undefined
            ? receiptConverter.toFirestore(bill.mostExpensiveReceipt)
            : undefined;

        const categoryMetaData = bill.categoryMetaData.map(metadata => {
            const categoryName = DataParser.getNameOfCategory(metadata.category)
            return {
                category: categoryName === undefined ? metadata.category : categoryName,
                receiptEntriesCount: metadata.receiptEntriesCount,
                itemAmount: metadata.itemAmount,
                itemEntriesCount: metadata.itemEntriesCount,
                totalPrice: metadata.totalPrice
            }
        });

        const categoryName = DataParser.getNameOfCategory(bill.mostCommonCategory)

        let updatedBill = {
            date: timeStampDate,
            name: bill.name,
            mostCommonCategory: categoryName === undefined ? bill.mostCommonCategory : categoryName,
            numberOfItems: bill.numberOfItems,
            numberOfReceipts: bill.numberOfReceipts,
            totalPrice: Math.round(bill.totalPrice * 100) / 100,
            mostExpensiveReceipt: mostExpensiveReceipt,
            mostExpensiveItemReceiptId: bill.mostExpensiveItemReceiptId,
            mostExpensiveItem: mostExpensiveItem,
            categoryMetaData: categoryMetaData,
            needsRefresh: bill.needsRefresh
        };

        if (updatedBill.mostExpensiveReceipt === undefined) {
            delete updatedBill.mostExpensiveReceipt;
        } else if (updatedBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
            delete updatedBill.mostExpensiveReceipt.mostExpensiveItem;
        }

        if (updatedBill.mostExpensiveItem === undefined) {
            delete updatedBill.mostExpensiveItem;
        }

        return updatedBill;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();

        const mostExpensiveItem = data.mostExpensiveItem !== undefined
            ? data.mostExpensiveItem as IReceiptItem
            : undefined;

        const mostExpensiveReceipt = data.mostExpensiveReceipt !== undefined
            ? data.mostExpensiveReceipt as IReceipt
            : undefined;

        const categoryMetaData = data.categoryMetaData.map((metadata: any) => {
            return {
                category: DataParser.getCategoryByName(metadata.category),
                itemAmount: metadata.itemAmount,
                itemEntriesCount: metadata.itemEntriesCount,
                receiptEntriesCount: metadata.receiptEntriesCount,
                totalPrice: metadata.totalPrice,
                receiptAmount: metadata.receiptAmount
            }
        });

        const bill: IBill = {
            date: moment(data.date.toDate()),
            name: data.name,
            mostCommonCategory: DataParser.getCategoryByName(data.mostCommonCategory),
            numberOfItems: data.numberOfItems,
            numberOfReceipts: data.numberOfReceipts,
            totalPrice: Math.round(data.totalPrice * 100) / 100,
            mostExpensiveReceipt: mostExpensiveReceipt,
            mostExpensiveItemReceiptId: data.mostExpensiveItemReceiptId,
            mostExpensiveItem: mostExpensiveItem,
            categoryMetaData: categoryMetaData,
            needsRefresh: data.needsRefresh
        }
        return bill;
    }
};

export async function getBills(user: User | null, token: string, year: string, month: string): Promise<IBill[]> {
    if (user === null || token.length < 36) { return []; } // TODO: add error

    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    return (await getDocumentCollectionData(billCollectionOfConnection, billConverter)).reverse();
}

export async function getBill(user: User | null, token: string, year: string, month: string, date: string): Promise<IBill | undefined> {
    if (user === null || token.length < 36 || date.length < 19) { return undefined; } // TODO: add error
    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    return await getDocumentData(billCollectionOfConnection, date, billConverter);
}

export async function addBill(user: User | null, token: string, year: string, month: string): Promise<string> {
    if (user === null || token.length < 36) { return ''; } // TODO: add error
    const billCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');
    const date = moment();


    const newBill: IBill = {
        name: DataParser.getDateNameByMoment(date),
        date: date,
        mostCommonCategory: DataParser.Category.None,
        numberOfItems: 0,
        numberOfReceipts: 0,
        totalPrice: 0,
        mostExpensiveItemReceiptId: '',
        categoryMetaData: [],
        needsRefresh: true
    }


    return await addDocument(billCollectionOfConnection, newBill.name, billConverter, newBill).then(isAdded => {
        if (isAdded) {
            return newBill.name;
        } else {
            return '';
        }
    });
}

export async function deleteBill(user: User | null, token: string, year: string, month: string, date: string): Promise<boolean> {
    if (user === null || token.length < 36) { return false; } // TODO: add error
    const billCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');
    const receiptCollection = [billCollection, date, DB_ACCESS_NAMES.RECEIPTS_DB_NAME].join('/');

    const receipts = (await getDocumentCollectionData(receiptCollection, receiptConverter)) as IReceipt[];

    for (let index = 0; index < receipts.length; index++) {
        const receipt = receipts[index];
        await deleteReceipt(user, token, year, month, date, receipt.receiptId);
    }

    const currentMonth = await getMonth(user, token, year, month);
    if (currentMonth !== undefined) {
        currentMonth.needsRefresh = true;
        await updateMonth(user, token, year, currentMonth);
    }

    return await deleteDocument(billCollection, date);
}

export async function updateBill(user: User | null, token: string, year: string, month: string, updatedBill: IBill): Promise<boolean> {
    if (user === null) { return false; } // TODO: add error
    const billCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    if (updatedBill.mostExpensiveReceipt === undefined) {
        delete updatedBill.mostExpensiveReceipt;
    } else if (updatedBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedBill.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedBill.mostExpensiveItem === undefined) {
        delete updatedBill.mostExpensiveItem;
    }

    return await updateDocumentData(billCollection, updatedBill.name, billConverter, updatedBill);
}

export async function updateBillStats(user: User | null, token: string, year: string, month: string, bill: IBill, isFullUpdate: boolean): Promise<IBill | undefined> {
    if (user === null) { return undefined; } // TODO: add error
    if (!bill.needsRefresh) { return bill; } else {
        bill.needsRefresh = false;

        const currentMonth = await getMonth(user, token, year, month);
        if (currentMonth !== undefined) {
            currentMonth.needsRefresh = true;
            await updateMonth(user, token, year, currentMonth);
        }
    }

    const billCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME, month, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');


    const updatedBill = bill;
    const receipts = await getReceipts(user, token, year, month, updatedBill.name, false);

    const categoryMetaData = Object.values(Category).slice((Object.keys(Category).length / 2)).map((category) => {
        return { category: category as Category, itemAmount: 0, itemEntriesCount: 0, receiptEntriesCount: 0, totalPrice: 0 };
    })

    let totalCost = 0;
    let numberOfItems = 0;

    let mostExpensiveItemReceiptId: string = '';
    let mostExpensiveItem: IReceiptItem | undefined = undefined;

    let mostExpensiveReceipt: IReceipt | undefined = undefined;

    for (let index = 0; index < receipts.length; index++) {
        let receipt = receipts[index];
        if (isFullUpdate) {
            const updatedReceipt = await updateReceiptStats(user, token, year, month, updatedBill.name, receipt);
            if (updatedReceipt !== undefined) {
                receipt = updatedReceipt;
            }
        }

        if (
            mostExpensiveItem === undefined ||
            (mostExpensiveItem !== undefined && receipt.mostExpensiveItem !== undefined && mostExpensiveItem.price < receipt.mostExpensiveItem.price)
        ) {
            mostExpensiveItem = receipt.mostExpensiveItem;
            mostExpensiveItemReceiptId = receipt.receiptId;
        }

        if (
            mostExpensiveReceipt === undefined ||
            (mostExpensiveReceipt !== undefined && mostExpensiveReceipt.totalPrice < receipt.totalPrice)
        ) {
            mostExpensiveReceipt = receipt;
        }

        totalCost += receipt.totalPrice;
        numberOfItems += receipt.amount;

        categoryMetaData.filter(category => category.category === receipt.mostCommonCategory)[0].receiptEntriesCount += 1;

        categoryMetaData.forEach((metaData, index) => {
            metaData.itemAmount += receipt.categoryMetaData.filter(category => category.category === metaData.category)[0].itemAmount;
            metaData.itemEntriesCount += receipt.categoryMetaData.filter(category => category.category === metaData.category)[0].itemEntriesCount;
            metaData.totalPrice += receipt.categoryMetaData.filter(category => category.category === metaData.category)[0].totalPrice;
        });
    }

    updatedBill.numberOfReceipts = receipts.length;
    updatedBill.numberOfItems = numberOfItems;

    updatedBill.totalPrice = Math.round(totalCost * 100) / 100;
    updatedBill.mostCommonCategory = categoryMetaData.sort((a, b) => a.receiptEntriesCount - b.receiptEntriesCount).reverse()[0].category as Category;

    updatedBill.mostExpensiveReceipt = mostExpensiveReceipt;

    updatedBill.mostExpensiveItemReceiptId = mostExpensiveItemReceiptId;
    updatedBill.mostExpensiveItem = mostExpensiveItem;

    updatedBill.categoryMetaData = categoryMetaData;

    if (updatedBill.mostExpensiveReceipt === undefined) {
        delete updatedBill.mostExpensiveReceipt;
    } else if (updatedBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedBill.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedBill.mostExpensiveItem === undefined) {
        delete updatedBill.mostExpensiveItem;
    }

    return await updateDocumentData(billCollection, updatedBill.name, billConverter, updatedBill).then(isSuccessful => {
        return isSuccessful ? updatedBill : undefined
    });
}
