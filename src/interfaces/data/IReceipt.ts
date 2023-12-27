import { Category } from "@/handlers/DataParser";
import { IReceiptItem } from "./IReceiptItem";

export interface IReceipt {
    receiptId: string,
    payedByUid: string,
    store: string,
    amount: number,
    totalPrice: number,
    items: IReceiptItem[],
    mostCommonCategory: Category,
    mostExpensiveItem?: IReceiptItem | undefined,
    categoryMetaData: { category: Category, itemAmount: number, itemEntriesCount: number, totalPrice: number }[]
}