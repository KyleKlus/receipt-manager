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
import IYear from "@/interfaces/data/IYear";
import { deleteMonth, getMonths, monthConverter, updateMonthStats } from "./firebaseMonthStore";

export const yearConverter = {
    toFirestore: (year: IYear) => {
        const timeStampDate: Timestamp = Timestamp.fromDate(year.date.toDate());

        const mostExpensiveItem = year.mostExpensiveItem !== undefined
            ? itemConverter.toFirestore(year.mostExpensiveItem)
            : undefined;

        const mostExpensiveReceipt = year.mostExpensiveReceipt !== undefined
            ? receiptConverter.toFirestore(year.mostExpensiveReceipt)
            : undefined;

        const mostExpensiveBill = year.mostExpensiveBill !== undefined
            ? billConverter.toFirestore(year.mostExpensiveBill)
            : undefined;

        const mostExpensiveMonth = year.mostExpensiveMonth !== undefined
            ? monthConverter.toFirestore(year.mostExpensiveMonth)
            : undefined;

        const categoryMetaData = year.categoryMetaData.map(metadata => {
            const categoryName = DataParser.getNameOfCategory(metadata.category)
            return {
                category: categoryName === undefined ? metadata.category : categoryName,
                itemAmount: metadata.itemAmount,
                billEntriesCount: metadata.billEntriesCount,
                receiptEntriesCount: metadata.receiptEntriesCount,
                itemEntriesCount: metadata.itemEntriesCount,
                monthEntriesCount: metadata.monthEntriesCount,
                totalPrice: metadata.totalPrice
            }
        });

        const categoryName = DataParser.getNameOfCategory(year.mostCommonCategory)


        let updatedYear = {
            date: timeStampDate,
            name: year.name,

            numberOfItems: year.numberOfItems,
            numberOfReceipts: year.numberOfReceipts,
            numberOfBills: year.numberOfBills,

            totalPrice: Math.round(year.totalPrice * 100) / 100,
            mostCommonCategory: categoryName === undefined ? year.mostCommonCategory : categoryName,

            mostExpensiveMonth: mostExpensiveMonth,

            mostExpensiveBillMonth: year.mostExpensiveBillMonth,
            mostExpensiveBill: mostExpensiveBill,

            mostExpensiveReceiptMonth: year.mostExpensiveReceiptMonth,
            mostExpensiveReceiptBillName: year.mostExpensiveReceiptBillName,
            mostExpensiveReceipt: mostExpensiveReceipt,

            mostExpensiveItemMonth: year.mostExpensiveItemMonth,
            mostExpensiveItemBillName: year.mostExpensiveItemBillName,
            mostExpensiveItemReceiptId: year.mostExpensiveItemReceiptId,
            mostExpensiveItem: mostExpensiveItem,

            categoryMetaData: categoryMetaData,
            needsRefresh: year.needsRefresh
        }

        if (updatedYear.mostExpensiveMonth === undefined) {
            delete updatedYear.mostExpensiveMonth;
        } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill === undefined) {
            delete updatedYear.mostExpensiveMonth.mostExpensiveBill;
        } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt === undefined) {
            delete updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt;
        } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
            delete updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
        }

        if (updatedYear.mostExpensiveBill === undefined) {
            delete updatedYear.mostExpensiveBill;
        } else if (updatedYear.mostExpensiveBill.mostExpensiveReceipt === undefined) {
            delete updatedYear.mostExpensiveBill.mostExpensiveReceipt;
        } else if (updatedYear.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
            delete updatedYear.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
        }

        if (updatedYear.mostExpensiveReceipt === undefined) {
            delete updatedYear.mostExpensiveReceipt;
        } else if (updatedYear.mostExpensiveReceipt.mostExpensiveItem === undefined) {
            delete updatedYear.mostExpensiveReceipt.mostExpensiveItem;
        }

        if (updatedYear.mostExpensiveItem === undefined) {
            delete updatedYear.mostExpensiveItem;
        }

        return updatedYear;
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

        const mostExpensiveMonth = data.mostExpensiveMonth !== undefined
            ? data.mostExpensiveMonth as IMonth
            : undefined;

        const categoryMetaData = data.categoryMetaData.map((metadata: any) => {
            return {
                category: DataParser.getCategoryByName(metadata.category),
                itemAmount: metadata.itemAmount,
                itemEntriesCount: metadata.itemEntriesCount,
                receiptEntriesCount: metadata.receiptEntriesCount,
                billEntriesCount: metadata.billEntriesCount,
                monthEntriesCount: metadata.monthEntriesCount,
                totalPrice: metadata.totalPrice,
                receiptAmount: metadata.receiptAmount
            }
        });

        const year: IYear = {
            date: moment(data.date.toDate()),
            name: data.name,

            numberOfItems: data.numberOfItems,
            numberOfReceipts: data.numberOfReceipts,
            numberOfBills: data.numberOfBills,

            totalPrice: Math.round(data.totalPrice * 100) / 100,
            mostCommonCategory: DataParser.getCategoryByName(data.mostCommonCategory),

            mostExpensiveMonth: mostExpensiveMonth,

            mostExpensiveBillMonth: data.mostExpensiveBillMonth,
            mostExpensiveBill: mostExpensiveBill,

            mostExpensiveReceiptMonth: data.mostExpensiveReceiptMonth,
            mostExpensiveReceiptBillName: data.mostExpensiveReceiptBillName,
            mostExpensiveReceipt: mostExpensiveReceipt,

            mostExpensiveItemMonth: data.mostExpensiveItemMonth,
            mostExpensiveItemBillName: data.mostExpensiveItemBillName,
            mostExpensiveItemReceiptId: data.mostExpensiveItemReceiptId,
            mostExpensiveItem: mostExpensiveItem,

            categoryMetaData: categoryMetaData,
            needsRefresh: data.needsRefresh
        };
        return year;
    }
};

export async function getYears(user: User | null, token: string): Promise<IYear[]> {
    if (user === null || token.length < 36) { return []; } // TODO: add error

    const yearCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME].join('/');
    return (await getDocumentCollectionData(yearCollectionOfConnection, yearConverter)).reverse();
}

export async function getYear(user: User | null, token: string, year: string): Promise<IYear | undefined> {
    if (user === null || token.length < 36) { return undefined; } // TODO: add error
    const yearCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME].join('/');

    return await getDocumentData(yearCollectionOfConnection, year, yearConverter);
}

export async function addYear(user: User | null, token: string): Promise<IYear | undefined> {
    if (user === null || token.length < 36) { return undefined; } // TODO: add error
    const yearCollectionOfConnection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME].join('/');
    const date = moment().startOf('year');

    const newYear: IYear = {
        name: date.format('YYYY'),
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
        mostExpensiveBillMonth: "",
        mostExpensiveReceiptMonth: "",
        mostExpensiveItemMonth: "",
        needsRefresh: true
    }


    return await addDocument(yearCollectionOfConnection, newYear.name, yearConverter, newYear).then(isAdded => {
        if (isAdded) {
            return newYear;
        } else {
            return undefined;
        }
    });
}

export async function deleteYear(user: User | null, token: string, year: string): Promise<boolean> {
    if (user === null || token.length < 36) { return false; } // TODO: add error
    const yearCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME].join('/');

    const monthsCollection = [yearCollection, year, DB_ACCESS_NAMES.MONTHS_DB_NAME].join('/');

    const months = (await getDocumentCollectionData(monthsCollection, monthConverter)) as IMonth[];

    for (let index = 0; index < months.length; index++) {
        const month = months[index];
        await deleteMonth(user, token, year, month.name);
    }

    return await deleteDocument(yearCollection, year);
}

export async function updateYear(user: User | null, token: string, updatedYear: IYear): Promise<IYear | undefined> {
    if (user === null) { return undefined; } // TODO: add error

    const yearCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME].join('/');

    if (updatedYear.mostExpensiveMonth === undefined) {
        delete updatedYear.mostExpensiveMonth;
    } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill === undefined) {
        delete updatedYear.mostExpensiveMonth.mostExpensiveBill;
    } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt === undefined) {
        delete updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt;
    } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedYear.mostExpensiveBill === undefined) {
        delete updatedYear.mostExpensiveBill;
    } else if (updatedYear.mostExpensiveBill.mostExpensiveReceipt === undefined) {
        delete updatedYear.mostExpensiveBill.mostExpensiveReceipt;
    } else if (updatedYear.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedYear.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedYear.mostExpensiveReceipt === undefined) {
        delete updatedYear.mostExpensiveReceipt;
    } else if (updatedYear.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedYear.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedYear.mostExpensiveItem === undefined) {
        delete updatedYear.mostExpensiveItem;
    }

    return await updateDocumentData(yearCollection, updatedYear.name, yearConverter, updatedYear).then(isSuccessful => {
        return isSuccessful ? updatedYear : undefined;
    });
}

export async function updateYearStats(user: User | null, token: string, year: IYear, isFullUpdate: boolean): Promise<IYear | undefined> {
    if (user === null) { return undefined; } // TODO: add error

    if (!year.needsRefresh) { return year } else {
        year.needsRefresh = false;
    }
    const yearCollection = [DB_ACCESS_NAMES.CONNECTION_DB_NAME, token, DB_ACCESS_NAMES.YEARS_DB_NAME, year, DB_ACCESS_NAMES.MONTHS_DB_NAME].join('/');

    const updatedYear = year;
    const months = await getMonths(user, token, updatedYear.name);

    const categoryMetaData = Object.values(Category).slice((Object.keys(Category).length / 2)).map((category) => {
        return { category: category as Category, itemAmount: 0, itemEntriesCount: 0, receiptEntriesCount: 0, monthEntriesCount: 0, billEntriesCount: 0, totalPrice: 0 };
    })

    let totalCost = 0;
    let numberOfItems = 0;
    let numberOfReceipts = 0;
    let numberOfBills = 0;

    let mostExpensiveMonth: IMonth | undefined = undefined;

    let mostExpensiveBillMonth: string = '';
    let mostExpensiveBill: IBill | undefined = undefined;

    let mostExpensiveReceiptMonth: string = '';
    let mostExpensiveReceiptBillName: string = '';
    let mostExpensiveReceipt: IReceipt | undefined = undefined;

    let mostExpensiveItemMonth: string = '';
    let mostExpensiveItemBillName: string = '';
    let mostExpensiveItemReceiptId: string = '';
    let mostExpensiveItem: IReceiptItem | undefined = undefined;

    for (let index = 0; index < months.length; index++) {
        let month = months[index];
        if (isFullUpdate) {
            const updatedMonth = await updateMonthStats(user, token, updatedYear.name, month, isFullUpdate);
            if (updatedMonth !== undefined) {
                month = updatedMonth;
            }
        }

        if (
            mostExpensiveItem === undefined ||
            (mostExpensiveItem !== undefined && month.mostExpensiveItem !== undefined && mostExpensiveItem.price < month.mostExpensiveItem.price)
        ) {
            mostExpensiveItemMonth = month.name;
            mostExpensiveItemBillName = month.mostExpensiveItemBillName;
            mostExpensiveItemReceiptId = month.mostExpensiveItemReceiptId;
            mostExpensiveItem = month.mostExpensiveItem;
        }

        if (
            mostExpensiveReceipt === undefined ||
            (mostExpensiveReceipt !== undefined && month.mostExpensiveReceipt !== undefined && mostExpensiveReceipt.totalPrice < month.mostExpensiveReceipt.totalPrice)
        ) {
            mostExpensiveReceiptMonth = month.name;
            mostExpensiveReceiptBillName = month.mostExpensiveReceiptBillName;
            mostExpensiveReceipt = month.mostExpensiveReceipt;
        }

        if (
            mostExpensiveBill === undefined ||
            (mostExpensiveBill !== undefined && month.mostExpensiveBill !== undefined && mostExpensiveBill.totalPrice < month.mostExpensiveBill.totalPrice)
        ) {
            mostExpensiveBillMonth = month.name;
            mostExpensiveBill = month.mostExpensiveBill;
        }

        if (
            mostExpensiveMonth === undefined ||
            (mostExpensiveMonth !== undefined && mostExpensiveMonth.totalPrice < month.totalPrice)
        ) {
            mostExpensiveMonth = month;
        }

        totalCost += month.totalPrice;
        numberOfItems += month.numberOfItems;
        numberOfReceipts += month.numberOfReceipts;
        numberOfBills += month.numberOfBills;

        categoryMetaData.filter(category => category.category === month.mostCommonCategory)[0].monthEntriesCount += 1;

        categoryMetaData.forEach((metaData, index) => {
            metaData.itemAmount += month.categoryMetaData.filter(category => category.category === metaData.category)[0].itemAmount;
            metaData.itemEntriesCount += month.categoryMetaData.filter(category => category.category === metaData.category)[0].itemEntriesCount;
            metaData.receiptEntriesCount += month.categoryMetaData.filter(category => category.category === metaData.category)[0].receiptEntriesCount;
            metaData.billEntriesCount += month.categoryMetaData.filter(category => category.category === metaData.category)[0].billEntriesCount;
            metaData.totalPrice += month.categoryMetaData.filter(category => category.category === metaData.category)[0].totalPrice;
        });
    }

    updatedYear.totalPrice = Math.round(totalCost * 100) / 100;
    updatedYear.mostCommonCategory = categoryMetaData.sort((a, b) => a.billEntriesCount - b.billEntriesCount).reverse()[0].category as Category;

    updatedYear.numberOfBills = numberOfBills;
    updatedYear.numberOfReceipts = numberOfReceipts;
    updatedYear.numberOfItems = numberOfItems;

    updatedYear.mostExpensiveBill = mostExpensiveMonth;

    updatedYear.mostExpensiveBillMonth = mostExpensiveBillMonth;
    updatedYear.mostExpensiveBill = mostExpensiveBill;

    updatedYear.mostExpensiveReceiptMonth = mostExpensiveReceiptMonth;
    updatedYear.mostExpensiveReceiptBillName = mostExpensiveReceiptBillName;
    updatedYear.mostExpensiveReceipt = mostExpensiveReceipt;

    updatedYear.mostExpensiveItemMonth = mostExpensiveItemMonth;
    updatedYear.mostExpensiveItemBillName = mostExpensiveItemBillName;
    updatedYear.mostExpensiveItemReceiptId = mostExpensiveItemReceiptId;
    updatedYear.mostExpensiveItem = mostExpensiveItem;

    updatedYear.categoryMetaData = categoryMetaData;

    if (updatedYear.mostExpensiveMonth === undefined) {
        delete updatedYear.mostExpensiveMonth;
    } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill === undefined) {
        delete updatedYear.mostExpensiveMonth.mostExpensiveBill;
    } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt === undefined) {
        delete updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt;
    } else if (updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedYear.mostExpensiveMonth.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedYear.mostExpensiveBill === undefined) {
        delete updatedYear.mostExpensiveBill;
    } else if (updatedYear.mostExpensiveBill.mostExpensiveReceipt === undefined) {
        delete updatedYear.mostExpensiveBill.mostExpensiveReceipt;
    } else if (updatedYear.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedYear.mostExpensiveBill.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedYear.mostExpensiveReceipt === undefined) {
        delete updatedYear.mostExpensiveReceipt;
    } else if (updatedYear.mostExpensiveReceipt.mostExpensiveItem === undefined) {
        delete updatedYear.mostExpensiveReceipt.mostExpensiveItem;
    }

    if (updatedYear.mostExpensiveItem === undefined) {
        delete updatedYear.mostExpensiveItem;
    }

    return await updateDocumentData(yearCollection, year.name, yearConverter, updatedYear).then(isSuccessful => {
        return isSuccessful ? updatedYear : undefined
    });
}
