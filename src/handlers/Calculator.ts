import { IReceipt } from "@/interfaces/IReceipt";

export function calcReceiptsExpenses(receipts: IReceipt[]): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        expenses += receipt.totalPrice;
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcPersonalExpenses(receipts: IReceipt[]): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (item.isMine) {
                expenses += item.price;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcSharedExpenses(receipts: IReceipt[]): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (item.isShared) {
                expenses += item.price / 2;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}

export function calcRejectedExpenses(receipts: IReceipt[]): number {
    let expenses: number = 0;

    receipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (item.isRejected) {
                expenses += item.price;
            }
        })
    })

    return Math.floor((expenses) * 100) / 100;
}