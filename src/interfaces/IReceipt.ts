import { Category } from "@/handlers/DataParser";
import { IReceiptItem } from "./IReceiptItem";

export interface IReceipt {
    payedByUid: string;
    store: string;
    totalPrice: number;
    mostCommonCategory: Category;
    items: IReceiptItem[];
}