import { Category } from "@/handlers/DataParser";


export interface IReceiptItem {
    name: string;
    price: number;
    amount: number;
    category: Category;
    ownerUids: string[];
}