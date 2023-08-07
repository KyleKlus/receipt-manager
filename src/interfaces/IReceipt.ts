import { IReceiptItem } from "./IReceiptItem";

export interface IReceipt {
    store: string;
    owner: string;
    items: IReceiptItem[];
}