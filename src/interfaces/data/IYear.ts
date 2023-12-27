import { Category } from "@/handlers/DataParser";
import { Moment } from "moment";
import { IReceiptItem } from "./IReceiptItem";
import { IReceipt } from "./IReceipt";
import IBill from "./IBill";
import IMonth from "./IMonth";

export default interface IYear {
    name: string,
    date: Moment,

    numberOfItems: number,
    numberOfReceipts: number,
    numberOfBills: number,

    totalPrice: number,
    mostCommonCategory: Category,

    mostExpensiveMonth?: IMonth | undefined,

    mostExpensiveBillMonth: string,
    mostExpensiveBill?: IBill | undefined,

    mostExpensiveReceiptMonth: string,
    mostExpensiveReceiptBillName: string,
    mostExpensiveReceipt?: IReceipt | undefined,

    mostExpensiveItemMonth: string,
    mostExpensiveItemBillName: string,
    mostExpensiveItemReceiptId: string,
    mostExpensiveItem?: IReceiptItem | undefined,

    categoryMetaData: {
        category: Category,
        itemAmount: number,
        itemEntriesCount: number,
        receiptEntriesCount: number,
        billEntriesCount: number,
        monthEntriesCount: number,
        totalPrice: number
    }[],
    needsRefresh: boolean
}