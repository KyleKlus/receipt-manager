import { Category } from "@/handlers/CSVParser";


export interface IReceiptItem {
    name: string;
    price: number;
    amount: number;
    category: Category;
    shared: boolean;
    rejected: boolean;
}