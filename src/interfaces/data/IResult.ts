export interface IResult {
    payerName: string;
    receiverName: string;
    payerExpenses: number;
    receiverExpenses: number;
    sharedFromPayer: number;
    sharedFromReceiver: number;
    payerItemsFromPayer: number;
    payerItemsFromReceiver: number;
    receiverItemsFromPayer: number;
    receiverItemsFromReceiver: number;
    result: number;
}