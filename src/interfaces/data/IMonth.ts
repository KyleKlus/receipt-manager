import { Category } from "@/handlers/DataParser";
import { Moment } from "moment";
import { IReceiptItem } from "./IReceiptItem";
import { IReceipt } from "./IReceipt";
import IBill from "./IBill";

export default interface IMonth {
    name: string,
    date: Moment,

    numberOfItems: number,
    numberOfReceipts: number,
    numberOfBills: number,

    totalPrice: number,
    mostCommonCategory: Category,

    mostExpensiveBill?: IBill | undefined,

    mostExpensiveReceiptBillName: string,
    mostExpensiveReceipt?: IReceipt | undefined,

    mostExpensiveItemBillName: string,
    mostExpensiveItemReceiptId: string,
    mostExpensiveItem?: IReceiptItem | undefined,

    categoryMetaData: {
        category: Category,
        itemAmount: number,
        itemEntriesCount: number,
        receiptEntriesCount: number,
        billEntriesCount: number,
        totalPrice: number
    }[]
}