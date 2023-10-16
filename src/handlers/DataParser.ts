import { IReceipt } from "@/interfaces/IReceipt";
import { IReceiptItem } from "@/interfaces/IReceiptItem";
import { IResult } from "@/interfaces/IResult";
import { ExportToCsv } from "export-to-csv";
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
    None
}

export const DEFAULT_CATEGORY: Category = Category.Food;

export function downloadCSV(name: string, myReceipts: IReceipt[], otherReceipts: IReceipt[]) {
    const data: string[] = [_prepCSVDataReceipts(myReceipts, otherReceipts)];
    if (name === undefined || data === undefined || name === '' || data.length === 0 || data[0] === '') { return; }
    const link = document.createElement('a');
    const fileBlob = new Blob(data, { type: 'text/csv' });
    link.href = URL.createObjectURL(fileBlob);
    link.download = name + '.csv';
    document.body.appendChild(link);
    link.click();
}

export function downloadEXCEL(name: string, myName: string, otherName: string, myReceipts: IReceipt[], otherReceipts: IReceipt[], result: IResult) {
    const myData: string = _prepCSVDataReceipts(myReceipts, otherReceipts);
    const otherData: string = _prepCSVDataReceipts(otherReceipts, myReceipts);
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

export function parseFileToReceipts(file: File, ownerName: string): Promise<IReceipt[]> {
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
                const receiptsHeader: string[] = result.toString().split('\n')[0].split(',');
                const receiptHeaderCount: number = receiptsHeader.length;
                const itemHeader: string[] = receiptsHeader.reverse()[0].split('|');
                const itemHeaderCount: number = itemHeader.length;
                const receiptsAsText: string[] = result.toString().split('\n').slice(1).filter((item) => { return item.length > 1 });

                for (let i: number = 0; i < receiptsAsText.length; i++) {
                    const receipt: string[] = receiptsAsText[i].split(',');
                    const receiptItems: string[][] = _listToMatrix(receipt.slice(receiptHeaderCount).join('').replaceAll('"', '').split('|'), itemHeaderCount).filter((item) => { return item.length > 1 });

                    let totalPrice = 0;

                    let parsedReceiptItems: IReceiptItem[] = receiptItems.map(list => {
                        let itemName = _firstCharToUppercase(list[0]);
                        itemName = itemName !== '' ? itemName : 'Unrecognized Item';
                        const itemAmount: number = list[5] === '' ? 1 : Math.floor(parseFloat(list[5]) * 100) / 100;
                        // NOTE: * -100 because all parsed prices have a - sign
                        const price: number = Math.floor(parseFloat(list[2]) * -100) / 100;
                        totalPrice += price;

                        return {
                            name: itemName,
                            price: price,
                            amount: itemAmount,
                            isMine: false,
                            isShared: true,
                            isRejected: false,
                            category: DEFAULT_CATEGORY
                        }
                    })

                    // Add store name to receipt
                    let storeName = _firstCharToUppercase(receipt[3]);
                    storeName = storeName !== '' ? storeName : 'Unrecognized Store';

                    const parsedReceipt: IReceipt = {
                        store: storeName,
                        owner: ownerName,
                        totalPrice: Math.floor(totalPrice * 100) / 100,
                        items: parsedReceiptItems,
                        categoryForAllItems: Category.None,
                        isAllShared: false,
                        isAllRejected: false,
                        isAllMine: false,
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

function _prepCSVDataReceipts(myReceipts: IReceipt[], otherReceipts: IReceipt[]): string {
    let dataString: string = '';

    if (myReceipts === undefined || otherReceipts === undefined) { return dataString; }
    if (myReceipts.length === 0 && otherReceipts.length === 0) { return dataString; }

    let filteredList: IReceiptItem[] = []
    let otherFilteredList: IReceiptItem[] = [];

    myReceipts.slice(0).forEach((itemArray) => {
        for (let index = 0; index < itemArray.items.length; index++) {
            const item = itemArray.items[index];
            if (item.isRejected) { continue; }
            if (item.isShared) {
                item.price = item.price / 2;
            }
            filteredList.push(item);
        }
    });

    otherReceipts.slice(0).forEach((itemArray) => {
        for (let index = 0; index < itemArray.items.length; index++) {
            const item = itemArray.items[index];
            if (item.isMine) { continue; }
            if (item.isShared) {
                item.price = item.price / 2;
            }
            otherFilteredList.push(item);
        }
    });

    const data = filteredList.concat(otherFilteredList).slice(0).map((e) => {
        return {
            name: e.name,
            price: e.price.toString().replace('.', ','),
            amount: e.amount.toString().replace('.', ','),
            category: Category[e.category],
            mine: e.isMine,
            shared: e.isShared,
            rejected: e.isRejected,
        }
    }).slice(0);

    if (data.length === 0) { return dataString; }

    const csvHeaders: string = 'Name;Price;Amount;Category;IsMyItem;IsSharedItem;IsRejectedItem';
    const csvDataArray: string[] = [csvHeaders, ...data.map((row) => {
        return [row.name, row.price, row.amount, row.category, row.mine, row.shared, row.rejected].join(';')
    })]

    const csvData: string = csvDataArray.join('\n');

    // const options = {
    //     fieldSeparator: ';',
    //     quoteStrings: '',
    //     decimalSeparator: ',',
    //     showLabels: true,
    //     showTitle: false,
    //     title: 'expenses',
    //     useTextFile: false,
    //     useBom: true,
    //     useKeysAsHeaders: true,
    //     // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    // };
    // const csvExporter = new ExportToCsv(options);
    // dataString = csvExporter.generateCsv(data, true);

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