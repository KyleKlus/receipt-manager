import { IReceipt } from "@/interfaces/data/IReceipt";
import { IReceiptItem } from "@/interfaces/data/IReceiptItem";
import { IResult } from "@/interfaces/data/IResult";
import moment, { Moment } from "moment";
import * as XLSX from 'xlsx';

export enum Category {
    Food,
    Pet,
    Household,
    Cleaning,
    Hygiene,
    Sport,
    Clothing,
    Activities,
    Medicine,
    Dates,
    Presents,
    Stationery,
    Travel,
    Misc,
    Rent,
    Formalities,
    Leisure,
    Discount,
    None
}


export const DEFAULT_CATEGORY: Category = Category.Food;

export function getNameOfCategory(category: Category): string {
    return (Object.keys(Category) as Array<keyof typeof Category>)
        .slice((Object.keys(Category).length / 2))[category];
}

export function getCategoryByName(name: string): Category {
    return (Object.keys(Category) as Array<keyof typeof Category>)
        .slice((Object.keys(Category).length / 2))
        .map((key) => { return key.toString() })
        .indexOf(name);
}

export function getDateNameByMoment(date: Moment): string {
    return date.format('DD-MM-YYYY_HH-mm-ss');
}

export function getDateNameByDateString(dateString: string): string {
    return getDateNameByMoment(moment(dateString));
}

// export function downloadCSV(name: string, myReceipts: IReceipt[], otherReceipts: IReceipt[]) {
//     const data: string[] = [_prepCSVDataReceipts(myReceipts, otherReceipts, )];
//     if (name === undefined || data === undefined || name === '' || data.length === 0 || data[0] === '') { return; }
//     const link = document.createElement('a');
//     const fileBlob = new Blob(data, { type: 'text/csv' });
//     link.href = URL.createObjectURL(fileBlob);
//     link.download = name + '.csv';
//     document.body.appendChild(link);
//     link.click();
// }

export function downloadEXCEL(
    name: string,
    myName: string,
    otherName: string,
    myUid: string,
    otherUid: string,
    myReceipts: IReceipt[],
    otherReceipts: IReceipt[],
    result: IResult
) {
    const myData: string = _prepCSVDataReceipts(myReceipts, otherReceipts, myUid, otherUid);
    const otherData: string = _prepCSVDataReceipts(otherReceipts, myReceipts, otherUid, myUid);
    const resultData: string = _prepCSVDataTotal(result);

    if (name === undefined || myData === undefined || name === '' || myData.length === 0 || myData[0] === '') { return; }

    const myArrayOfArrayCsv = myData.split("\n").map((row: string) => {
        return row.split(';');
    });
    const otherArrayOfArrayCsv = otherData.split("\n").map((row: string) => {
        return row.split(';');
    });
    const resultArrayOfArrayCsv = resultData.split("\n").map((row: string) => {
        return row.split(';');
    });


    const wb = XLSX.utils.book_new();
    const myWs = XLSX.utils.aoa_to_sheet(myArrayOfArrayCsv);
    const otherWs = XLSX.utils.aoa_to_sheet(otherArrayOfArrayCsv);
    const resultWs = XLSX.utils.aoa_to_sheet(resultArrayOfArrayCsv);

    XLSX.utils.book_append_sheet(wb, myWs, myName + '_' + name);
    XLSX.utils.book_append_sheet(wb, otherWs, otherName + '_' + name);
    XLSX.utils.book_append_sheet(wb, resultWs, 'Result_' + name);

    XLSX.writeFileXLSX(wb, name + '.xlsx', { type: 'file' });
}

export function parseFileToReceipts(file: File, payedByUid: string, sharedByUid: string): Promise<IReceipt[]> {
    let receipts: IReceipt[] = []

    let reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        reader.onload = () => {
            const result = reader.result;

            if (result !== null && result !== undefined) {
                const receiptsColumns: string[] = result.toString().split('\n')[0].split(',');
                const receiptColumnsCount: number = receiptsColumns.length;
                const itemColumns: string[] = receiptsColumns.reverse()[0].split('|');
                const itemColumnsCount: number = itemColumns.length;
                const receiptsAsText: string[] = result.toString().split('\n').slice(1).filter((item) => { return item.length > 1 });

                for (let i: number = 0; i < receiptsAsText.length; i++) {
                    const receipt: string[] = receiptsAsText[i].split(',');
                    const receiptItems: string[][] = _listToMatrix(receipt.slice(receiptColumnsCount).join('').replaceAll('"', '').split('|'), itemColumnsCount).filter((item) => { return item.length > 1 });

                    let totalPrice = 0;

                    let parsedReceiptItems: IReceiptItem[] = receiptItems.map(list => {
                        let itemName = _firstCharToUppercase(list[0]);
                        itemName = itemName !== '' ? itemName : 'Unrecognized Item';
                        const itemAmount: number = list[5] === '' ? 1 : Math.floor(parseFloat(list[5]) * 100) / 100;
                        // NOTE: * -100 because all parsed prices have a - sign
                        const price: number = Math.floor(parseFloat(list[2]) * -100) / 100;
                        totalPrice += price;

                        return {
                            itemId: _generateNewId(),
                            ownerUids: [payedByUid, sharedByUid],
                            name: itemName,
                            price: Math.round(price * 100) / 100,
                            amount: itemAmount,
                            category: price < 0 ? Category.Discount : DEFAULT_CATEGORY
                        }
                    })

                    // Add store name to receipt
                    let storeName = _firstCharToUppercase(receipt[3]);
                    storeName = storeName !== '' ? storeName : 'Unrecognized Store';

                    const parsedReceipt: IReceipt = {
                        receiptId: _generateNewId(),
                        payedByUid: payedByUid,
                        store: storeName,
                        totalPrice: Math.round(totalPrice * 100) / 100,
                        items: parsedReceiptItems,
                        amount: parsedReceiptItems.length,
                        mostCommonCategory: DEFAULT_CATEGORY
                    }

                    receipts = receipts.concat(parsedReceipt)
                }
            }

            resolve(receipts);
        };

        reader.readAsText(file);
    });
}

function _listToMatrix(list: string[], elementsPerSubArray: number) {
    const matrix: string[][] = [];
    let k = -1;

    for (let i = 0; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }

        matrix[k].push(list[i]);
    }

    return matrix;
}

function _firstCharToUppercase(text: string): string {
    if (text !== undefined && text !== '' && text.length > 1) {
        // Make first letter of text uppercase
        const firstLetterOfText: string = text[0].toUpperCase();
        const restOfText: string = text.slice(1);
        return firstLetterOfText + restOfText;
    }
    return '';
}

function _generateNewId(): string {
    return crypto.randomUUID().split('-').slice(0, -1).join('-');
}

function _prepCSVDataReceipts(myReceipts: IReceipt[], otherReceipts: IReceipt[], myUid: string, otherUid: string): string {
    let dataString: string = '';

    if (myReceipts === undefined || otherReceipts === undefined) { return dataString; }
    if (myReceipts.length === 0 && otherReceipts.length === 0) { return dataString; }

    let myFilteredList: IReceiptItem[] = []

    const addMyItemsFromReceiptsToList = (receipts: IReceipt[]) => {
        receipts.slice(0).forEach((receipt) => {
            for (let index = 0; index < receipt.items.length; index++) {
                const item = receipt.items[index];

                if (isOthers(item, otherUid)) {
                    continue;
                }

                if (isShared(item)) {
                    item.price = item.price / 2;
                }
                myFilteredList.push(item);
            }
        });
    }

    addMyItemsFromReceiptsToList(myReceipts);
    addMyItemsFromReceiptsToList(otherReceipts);

    const data = myFilteredList.slice(0).map((e) => {
        return {
            name: e.name,
            price: e.price.toFixed(2).replace('.', ','),
            amount: e.amount.toString().replace('.', ','),
            category: Category[e.category],
            mine: isMine(e, myUid),
            shared: isShared(e),
            rejected: isOthers(e, otherUid),
        }
    }).slice(0);

    if (data.length === 0) { return dataString; }

    const csvHeaders: string = 'Name;Price;Amount;Category;IsMyItem;IsSharedItem;IsRejectedItem';
    const csvDataArray: string[] = [csvHeaders, ...data.map((row) => {
        return [row.name, row.price, row.amount, row.category, row.mine, row.shared, row.rejected].join(';')
    })]

    const csvData: string = csvDataArray.join('\n');
    return csvData;
}

function _prepCSVDataTotal(resultData: IResult): string {
    let dataString: string = '';

    if (resultData === undefined) { return dataString; }

    const csvHeaders: string = 'Stuff;' + resultData.payerName + '`s Values;' + resultData.receiverName + '`s Values;';
    const csvDataArray: string[] = [csvHeaders];

    csvDataArray.push('Personal Items from ' + resultData.payerName + '`s receipts;'
        + (resultData.payerItemsFromPayer).toString().replace('.', ',') + ';'
        + (resultData.receiverItemsFromPayer).toString().replace('.', ',') + ';');

    csvDataArray.push('Personal Items from ' + resultData.receiverName + '`s receipts;'
        + (resultData.payerItemsFromReceiver).toString().replace('.', ',') + ';'
        + (resultData.receiverItemsFromReceiver).toString().replace('.', ',') + ';');

    csvDataArray.push('Shared Items from ' + resultData.payerName + '`s receipts;'
        + (resultData.sharedFromPayer).toString().replace('.', ',') + ';'
        + (resultData.sharedFromPayer).toString().replace('.', ',') + ';');

    csvDataArray.push('Shared Items from ' + resultData.receiverName + '`s receipts;'
        + (resultData.sharedFromReceiver).toString().replace('.', ',') + ';'
        + (resultData.sharedFromReceiver).toString().replace('.', ',') + ';');

    csvDataArray.push('Money paid;'
        + (-1 * resultData.payerExpenses).toString().replace('.', ',') + ';'
        + (-1 * resultData.receiverExpenses).toString().replace('.', ',') + ';');

    csvDataArray.push('Result;' + (-1 * resultData.result).toString().replace('.', ',')
        + ';' + (resultData.result).toString().replace('.', ',') + ';');


    const csvData: string = csvDataArray.join('\n');

    return csvData;
}

export function isMine(item: IReceiptItem, myUid: string): boolean {
    return item.ownerUids.length === 1 && item.ownerUids.indexOf(myUid) !== -1;
}

export function isShared(item: IReceiptItem): boolean {
    return item.ownerUids.length === 0 || item.ownerUids.length === 2;
}

export function isOthers(item: IReceiptItem, otherUid: string): boolean {
    return isMine(item, otherUid);
}