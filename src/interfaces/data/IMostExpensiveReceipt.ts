import { Category } from "@/handlers/DataParser";
import { IReceiptItem } from "./IReceiptItem";

export interface IMostExpensiveReceipt {
    receiptId: string,
    payedByUid: string,
    store: string,
    amount: number,
    totalPrice: number,
    mostCommonCategory: Category,
    mostExpensiveItemId: string,
}