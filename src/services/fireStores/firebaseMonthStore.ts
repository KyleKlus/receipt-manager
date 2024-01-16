import { User } from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import IMonth from "@/interfaces/data/IMonth";
import moment from "moment";

import * as DataParser from '../../handlers/DataParser';
import { DB_ACCESS_NAMES, addDocument, deleteDocument, getDocumentCollectionData, getDocumentData, updateDocumentData } from "./firebaseStore";
import { deleteReceipt, getReceipts, receiptConverter, updateReceiptStats } from "./firebaseReceiptStore";
import { IReceipt } from "@/interfaces/data/IReceipt";
import { Category } from "../../handlers/DataParser";
import { itemConverter } from "./firebaseItemStore";
import { IReceiptItem } from "@/interfaces/data/IReceiptItem";
import { billConverter, deleteBill, getBills, updateBillStats } from "./firebaseBillStore";
import IBill from "@/interfaces/data/IBill";
import { getYear, updateYear } from "./firebaseYearStore";

export const monthConverter = {
    toFirestore: (month: IMonth) => {
        const timeStampDate: Timestamp = Timestamp.fromDate(month.date.toDate());

        const mostExpensiveItem = month.mostExpensiveItem !== undefined
            ? itemConverter.toFirestore(month.mostExpensiveItem)
            : undefined;

        const mostExpensiveReceipt = month.mostExpensiveReceipt !== undefined
            ? receiptConverter.toFirestore(month.mostExpensiveReceipt)
            : undefined;

        const mostExpensiveBill = month.mostExpensiveBill !== undefined
            ? billConverter.toFirestore(month.mostExpensiveBill)
            : undefined;

        const categoryMetaData = month.categoryMetaData.map(metadata => {
            const categoryName = DataParser.getNameOfCategory(metadata.category)
            return {
                category: categoryName === undefined ? metadata.category : categoryName,
                receiptEntriesCount: metadata.receiptEntriesCount,
                billEntriesCount: metadata.billEntriesCount,
                itemAmount: metadata.itemAmount,
                itemEntriesCount: metadata.itemEntriesCount,
                totalPrice: metadata.totalPrice
            }
        });

        const categoryName = DataParser.getNameOfCategory(month.mostCommonCategory)


        let updatedMonth = {
            date: timeStampDate,
            name: month.name,

            numberOfItems: month.numberOfItems,
            numberOfReceipts: month.numberOfReceipts,
            numberOfBills: month.numberOfBills,

            totalPrice: Math.round(month.totalPrice * 100) / 100,
            mostCommonCategory: categoryName === undefined ? month.mostCommonCategory : categoryName,

            mostExpensiveBill: mostExpensiveBill,

            mostExpensiveReceiptBillName: month.mostExpensiveReceiptBillName,
            mostExpensiveReceipt: mostExpensiveReceipt,

            mostExpensiveItemBillName: month.mostExpensiveItemBillName,
            mostExpensiveItemReceiptId: month.mostExpensiveItemReceiptId,
            mostExpensiveItem: mostExpensiveItem,

            categoryMetaData: categoryMetaData,
            needsRefresh: month.needsRefresh
        };

        if (updatedMonth.mostExpensiveBill === undefined) {
            delete updatedMonth.mostExpensiveBill;
        } else if (updatedMonth.mostExpensiveBill.mostExpensiveReceipt === undefined) {
            delete updatedMonth.mostExpensiveBill.mostExpensiveReceipt;
        } else if (updatedMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
            delete updatedMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
        }


        if (updatedMonth.mostExpensiveReceipt === undefined) {
            delete updatedMonth.mostExpensiveReceipt;
        } else if (updatedMonth.mostExpensiveReceipt.mostExpensiveItem === undefined) {
            delete updatedMonth.mostExpensiveReceipt.mostExpensiveItem;
        }

        if (updatedMonth.mostExpensiveItem === undefined) {
            delete updatedMonth.mostExpensiveItem;
        }

        return updatedMonth;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = snapshot.data();

        const mostExpensiveItem = data.mostExpensiveItem !== undefined
            ? data.mostExpensiveItem as IReceiptItem
            : undefined;

        const mostExpensiveReceipt = data.mostExpensiveReceipt !== undefined
            ? data.mostExpensiveReceipt as IReceipt
            : undefined;

        const mostExpensiveBill = data.mostExpensiveBill !== undefined
            ? data.mostExpensiveBill as IBill
            : undefined;

        const categoryMetaData = data.categoryMetaData.map((metadata: any) => {
            return {
                category: DataParser.getCategoryByName(metadata.category),
                itemAmount: metadata.itemAmount,
                itemEntriesCount: metadata.itemEntriesCount,
                receiptEntriesCount: metadata.receiptEntriesCount,
                billEntriesCount: metadata.billEntriesCount,
                totalPrice: metadata.totalPrice,
                receiptAmount: metadata.receiptAmount
            }
        });

        const month: IMonth = {
            date: moment(data.date.toDate()),
            name: data.name,

            numberOfItems: data.numberOfItems,
            numberOfReceipts: data.numberOfReceipts,
            numberOfBills: data.numberOfBills,

            totalPrice: Math.round(data.totalPrice * 100) / 100,
            mostCommonCategory: DataParser.getCategoryByName(data.mostCommonCategory),

            mostExpensiveBill: mostExpensiveBill,

            mostExpensiveReceiptBillName: data.mostExpensiveReceiptBillName,
            mostExpensiveReceipt: mostExpensiveReceipt,

            mostExpensiveItemBillName: data.mostExpensiveItemBillName,
            mostExpensiveItemReceiptId: data.mostExpensiveItemReceiptId,
            mostExpensiveItem: mostExpensiveItem,

            categoryMetaData: categoryMetaData,
            needsRefresh: data.needsRefresh
        }
        return month;
    }
};

export async function getMonths(user: User | null, token: string, year: string): Promise<IMonth[]> {
    if (user === null || token.length < 36) { return []; } // TODO: add error

    const monthCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME].join('/');
    return (await getDocumentCollectionData(monthCollectionOfConnection, monthConverter)).reverse();
}

export async function getMonth(user: User | null, token: string, year: string, month: string): Promise<IMonth | undefined> {
    if (user === null || token.length < 36) { return undefined; } // TODO: add error
    const monthCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME].join('/');

    return await getDocumentData(monthCollectionOfConnection, month, monthConverter);
}

export async function addMonth(user: User | null, token: string, year: string): Promise<IMonth | undefined> {
    if (user === null || token.length < 36) { return undefined; } // TODO: add error
    const monthCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME].join('/');
    const date = moment().year(parseInt(year, 10)).startOf('month');

    const newMonth: IMonth = {
        name: date.format('MM-YYYY'),
        date: date,

        numberOfItems: 0,
        numberOfReceipts: 0,
        numberOfBills: 0,

        totalPrice: 0,
        mostCommonCategory: DataParser.Category.None,

        mostExpensiveReceiptBillName: '',

        mostExpensiveItemBillName: '',
        mostExpensiveItemReceiptId: '',

        categoryMetaData: [],
        needsRefresh: true
    }


    return await addDocument(monthCollectionOfConnection, newMonth.name, monthConverter, newMonth).then(isAdded => {
        if (isAdded) {
            return newMonth;
        } else {
            return undefined;
        }
    });
}

export async function deleteMonth(user: User | null, token: string, year: string, month: string): Promise<boolean> {
    if (user === null || token.length < 36) { return false; } // TODO: add error
    const monthCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME].join('/');

    const billCollection = [monthCollection, month, DB_ACCESS_NAMES.BILLS_DB_NAME].join('/');

    const bills = (await getDocumentCollectionData(billCollection, billConverter)) as IBill[];

    for (let index = 0; index < bills.length; index++) {
        const bill = bills[index];
        await deleteBill(user, token, year, month, bill.name);
    }

    return await deleteDocument(monthCollection, month);
}

export async function updateMonth(user: User | null, token: string, year: string, updatedMonth: IMonth): Promise<IMonth | undefined> {
    if (user === null) { return undefined; } // TODO: add error
    const monthCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME].join('/');

    if (updatedMonth.mostExpensiveBill === undefined) {
        delete updatedMonth.mostExpensiveBill;
    } else if (updatedMonth.mostExpensiveBill.mostExpensiveReceipt === undefined) {
        delete updatedMonth.mostExpensiveBill.mostExpensiveReceipt;
    } else if (updatedMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
    }


    if (updatedMonth.mostExpensiveReceipt === undefined) {
        delete updatedMonth.mostExpensiveReceipt;
    } else if (updatedMonth.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedMonth.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedMonth.mostExpensiveItem === undefined) {
        delete updatedMonth.mostExpensiveItem;
    }

    return await updateDocumentData(monthCollection, updatedMonth.name, monthConverter, updatedMonth).then(isSuccessful => {
        return isSuccessful ? updatedMonth : undefined;
    });
}

export async function updateMonthStats(user: User | null, token: string, year: string, month: IMonth, isFullUpdate: boolean): Promise<IMonth | undefined> {
    if (user === null) { return undefined; } // TODO: add error
    if (!month.needsRefresh) { return month; } else {
        month.needsRefresh = false;

        const currentYear = await getYear(user, token, year);
        if (currentYear !== undefined) {
            currentYear.needsRefresh = true;
            await updateYear(user, token, currentYear);
        }
    }
    const monthCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME].join('/');

    const updatedMonth = month;
    const bills = await getBills(user, token, year, updatedMonth.name);

    const categoryMetaData = Object.values(Category).slice((Object.keys(Category).length / 2)).map((category) => {
        return { category: category as Category, itemAmount: 0, itemEntriesCount: 0, receiptEntriesCount: 0, billEntriesCount: 0, totalPrice: 0 };
    })

    let totalCost = 0;
    let numberOfItems = 0;
    let numberOfReceipts = 0;

    let mostExpensiveBill: IBill | undefined = undefined;

    let mostExpensiveReceiptBillName: string = '';
    let mostExpensiveReceipt: IReceipt | undefined = undefined;

    let mostExpensiveItemBillName: string = '';
    let mostExpensiveItemReceiptId: string = '';
    let mostExpensiveItem: IReceiptItem | undefined = undefined;

    for (let index = 0; index < bills.length; index++) {
        let bill = bills[index];
        if (isFullUpdate) {
            const updatedBill = await updateBillStats(user, token, year, updatedMonth.name, bill, isFullUpdate);
            if (updatedBill !== undefined) {
                bill = updatedBill;
            }
        }

        if (
            mostExpensiveItem === undefined ||
            (mostExpensiveItem !== undefined && bill.mostExpensiveItem !== undefined && mostExpensiveItem.price < bill.mostExpensiveItem.price)
        ) {
            mostExpensiveItemBillName = bill.name;
            mostExpensiveItemReceiptId = bill.mostExpensiveItemReceiptId;
            mostExpensiveItem = bill.mostExpensiveItem;
        }

        if (
            mostExpensiveReceipt === undefined ||
            (mostExpensiveReceipt !== undefined && bill.mostExpensiveReceipt !== undefined && mostExpensiveReceipt.totalPrice < bill.mostExpensiveReceipt.totalPrice)
        ) {
            mostExpensiveReceiptBillName = bill.name;
            mostExpensiveReceipt = bill.mostExpensiveReceipt;
        }

        if (
            mostExpensiveBill === undefined ||
            (mostExpensiveBill !== undefined && mostExpensiveBill.totalPrice < bill.totalPrice)
        ) {
            mostExpensiveBill = bill;
        }

        totalCost += bill.totalPrice;
        numberOfItems += bill.numberOfItems;
        numberOfReceipts += bill.numberOfReceipts;

        categoryMetaData.filter(category => category.category === bill.mostCommonCategory)[0].billEntriesCount += 1;

        categoryMetaData.forEach((metaData, index) => {
            metaData.itemAmount += bill.categoryMetaData.filter(category => category.category === metaData.category)[0].itemAmount;
            metaData.itemEntriesCount += bill.categoryMetaData.filter(category => category.category === metaData.category)[0].itemEntriesCount;
            metaData.receiptEntriesCount += bill.categoryMetaData.filter(category => category.category === metaData.category)[0].receiptEntriesCount;
            metaData.totalPrice += bill.categoryMetaData.filter(category => category.category === metaData.category)[0].totalPrice;
        });
    }

    updatedMonth.totalPrice = Math.round(totalCost * 100) / 100;
    updatedMonth.mostCommonCategory = categoryMetaData.sort((a, b) => a.billEntriesCount - b.billEntriesCount).reverse()[0].category as Category;

    updatedMonth.numberOfBills = bills.length;
    updatedMonth.numberOfReceipts = numberOfReceipts;
    updatedMonth.numberOfItems = numberOfItems;

    updatedMonth.mostExpensiveBill = mostExpensiveBill;

    updatedMonth.mostExpensiveReceiptBillName = mostExpensiveReceiptBillName;
    updatedMonth.mostExpensiveReceipt = mostExpensiveReceipt;

    updatedMonth.mostExpensiveItemBillName = mostExpensiveItemBillName;
    updatedMonth.mostExpensiveItemReceiptId = mostExpensiveItemReceiptId;
    updatedMonth.mostExpensiveItem = mostExpensiveItem;

    updatedMonth.categoryMetaData = categoryMetaData;

    if (updatedMonth.mostExpensiveBill === undefined) {
        delete updatedMonth.mostExpensiveBill;
    } else if (updatedMonth.mostExpensiveBill.mostExpensiveReceipt === undefined) {
        delete updatedMonth.mostExpensiveBill.mostExpensiveReceipt;
    } else if (updatedMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
    }


    if (updatedMonth.mostExpensiveReceipt === undefined) {
        delete updatedMonth.mostExpensiveReceipt;
    } else if (updatedMonth.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedMonth.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedMonth.mostExpensiveItem === undefined) {
        delete updatedMonth.mostExpensiveItem;
    }

    return await updateDocumentData(monthCollection, month.name, monthConverter, updatedMonth).then(isSuccessful => {
        return isSuccessful ? updatedMonth : undefined
    });
}
