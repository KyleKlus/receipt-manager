import { Category } from "@/handlers/DataParser";
import { IReceiptItem } from "./IReceiptItem";

// TODO: add more stats

export interface IReceipt {
    receiptId: string;
    payedByUid: string;
    store: string;
    totalPrice: number;
    mostCommonCategory: Category;
    amount: number;
    items: IReceiptItem[];
}