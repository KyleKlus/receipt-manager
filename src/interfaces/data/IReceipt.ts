import { Category } from "@/handlers/DataParser";
import { IReceiptItem } from "./IReceiptItem";
import { Moment } from "moment";

export interface IReceipt {
    receiptId: string;
    payedByUid: string;
    store: string;
    totalPrice: number;
    mostCommonCategory: Category;
    amount: number;
    items: IReceiptItem[];
}