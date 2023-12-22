import { IReceipt } from "@/interfaces/data/IReceipt";
import { isMine, isOthers, isShared } from "./DataParser";

export function calcReceiptsExpenses(receipts: IReceipt[]): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        expenses += receipt.totalPrice;
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcPersonalExpenses(receipts: IReceipt[], myUid: string): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (isMine(item, myUid)) {
                expenses += item.price;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcSharedExpenses(receipts: IReceipt[], myUid: string, otherUid: string): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (isShared(item)) {
                expenses += item.price / 2;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcRejectedExpenses(receipts: IReceipt[], myUid: string, otherUid: string): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (isOthers(item, otherUid)) {
                expenses += item.price;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}