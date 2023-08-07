import { Category } from "@/handlers/CSVParser";
import { IReceiptItem } from "./IReceiptItem";

export interface IReceipt {
    store: string;
    owner: string;
    totalPrice: number;
    items: IReceiptItem[];
    categoryForAllItems: Category
    isAllShared: boolean;
    isAllRejected: boolean;
    isAllMine: boolean;
}