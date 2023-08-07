import { IReceipt } from "@/interfaces/IReceipt";
import { IReceiptItem } from "@/interfaces/IReceiptItem";
import { ExportToCsv } from "export-to-csv";

export enum Category {
    Activities,
    Cleaning,
    Cosmetics,
    Dates,
    Food,
    Household,
    Hygiene,
    Hardware,
    Misc,
    Pet,
    Sport,
    Travel,
    None
}

export const DEFAULT_CATEGORY: Category = Category.Food;

export function downloadCSV(name: string, myReceipts: IReceipt[], otherReceipts: IReceipt[]) {
    const data: string[] = [_prepCSVData(myReceipts, otherReceipts)];
    if (name === undefined || data === undefined || name === '' || data.length === 0 || data[0] === '') { return; }
    const link = document.createElement('a');
    const fileBlob = new Blob(data, { type: 'text/csv' });
    link.href = URL.createObjectURL(fileBlob);
    link.download = name + '.csv';
    document.body.appendChild(link);
    link.click();
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


function _prepCSVData(myReceipts: IReceipt[], otherReceipts: IReceipt[]): string {
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
            price: e.price,
            amount: e.amount,
            category: Category[e.category],
            mine: e.isMine,
            shared: e.isShared,
            rejected: e.isRejected,
        }
    }).slice(0);

    if (data.length === 0) { return dataString; }

    const options = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: false,
        title: 'expenses',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };
    const csvExporter = new ExportToCsv(options);
    dataString = csvExporter.generateCsv(data, true);

    return dataString;
}