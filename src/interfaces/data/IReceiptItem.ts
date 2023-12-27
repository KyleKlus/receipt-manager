import { Category } from "@/handlers/DataParser";

export interface IReceiptItem {
    itemId: string;
    name: string;
    price: number;
    amount: number;
    category: Category;
    ownerUids: string[];
}