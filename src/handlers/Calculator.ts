import { IReceipt } from "@/interfaces/data/IReceipt";
import { isMine, isOthers, isShared } from "./DataParser";

export function calcReceiptsExpenses(receipts: IReceipt[]): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
                expenses += item.price;
        })
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcPersonalExpensesFromMyReceipts(myReceipts: IReceipt[], myUid: string): number {
    let expenses: number = 0;

    myReceipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (isMine(item, myUid)) {
                expenses += item.price;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcPersonalExpensesFromOtherReceipts(otherReceipts: IReceipt[], myUid: string): number {
    return calcPersonalExpensesFromMyReceipts(otherReceipts, myUid);
}

export function calcSharedExpensesFromMyReceipts(myReceipts: IReceipt[], myUid: string): number {
    let expenses: number = 0;

    myReceipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (isShared(item, myUid)) {
                expenses += item.price / 2;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcSharedExpensesFromOtherReceipts(otherReceipts: IReceipt[], myUid: string): number {
    let expenses: number = 0;

    otherReceipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (isShared(item, myUid)) {
                expenses += item.price / 2;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}
