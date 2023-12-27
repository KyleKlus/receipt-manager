import { Category } from "@/handlers/DataParser";
import { Moment } from "moment";
import { IReceiptItem } from "./IReceiptItem";
import { IReceipt } from "./IReceipt";

export default interface IBill {
    name: string,
    date: Moment,
    numberOfItems: number,
    numberOfReceipts: number,
    totalPrice: number,
    mostCommonCategory: Category,
    mostExpensiveReceipt?: IReceipt | undefined,
    mostExpensiveItemReceiptId: string,
    mostExpensiveItem?: IReceiptItem | undefined,
    categoryMetaData: {
        category: Category,
        itemAmount: number,
        itemEntriesCount: number,
        receiptEntriesCount: number,
        totalPrice: number
    }[],
    needsRefresh: boolean
}