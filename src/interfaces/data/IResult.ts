export interface IResult {
    payerName: string;
    receiverName: string;
    payerPaidExpenses: number;
    receiverPaidExpenses: number;
    sharedFromPayer: number;
    sharedFromReceiver: number;
    payerItemsFromPayer: number;
    payerItemsFromReceiver: number;
    receiverItemsFromPayer: number;
    receiverItemsFromReceiver: number;
    receiverOverhang: number;
}