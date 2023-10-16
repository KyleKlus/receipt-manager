/** @format */
import styles from '@/styles/components/personCell/PersonCard.module.css';
import { ChangeEvent, useState } from 'react';
import { IReceiptItem } from '@/interfaces/IReceiptItem';
import { IReceipt } from '@/interfaces/IReceipt';
import * as DataParser from '@/handlers/DataParser';
import * as Calculator from '@/handlers/Calculator';
import ReceiptsOverview from './ReceiptsOverview';
import moment from 'moment';
import { IResult } from '@/interfaces/IResult';

export default function PersonCard(props: {
    myName: string,
    otherName: string,
    isFirst: boolean,
    myReceipts: IReceipt[],
    otherReceipts: IReceipt[],
    setPersonName: (name: string, isFirst: boolean) => void;
    setReceipts: (receipts: IReceipt[], isFirst: boolean) => void;
    uploadFile: (files: FileList | null, isFirst: boolean) => Promise<void>;
}) {
    const {
        myName,
        otherName,
        isFirst,
        myReceipts,
        otherReceipts,
        setPersonName,
        setReceipts,
        uploadFile
    } = props;

    const [newItemStore, setNewItemStore] = useState<string>('');
    const [newItemName, setNewItemName] = useState<string>('');
    const [newItemPrice, setNewItemPrice] = useState<number>(NaN);
    const [newItemAmount, setNewItemAmount] = useState<number>(NaN);

    const myReceiptsExpenses: number = Calculator.calcReceiptsExpenses(myReceipts);
    const otherReceiptsExpenses: number = Calculator.calcReceiptsExpenses(otherReceipts);

    const myItemsFromMe: number = Calculator.calcPersonalExpenses(myReceipts);
    const otherItemsFromOther: number = Calculator.calcPersonalExpenses(otherReceipts);
    const sharedFromMe: number = Calculator.calcSharedExpenses(myReceipts);
    const myExpensesFromMe: number = Math.floor((myItemsFromMe + sharedFromMe) * 100) / 100;

    const myItemsFromOther: number = Calculator.calcRejectedExpenses(otherReceipts);
    const otherItemsFromMe: number = Calculator.calcRejectedExpenses(myReceipts);
    const sharedFromOther: number = Calculator.calcSharedExpenses(otherReceipts);
    const myExpensesFromOther: number = Math.floor((myItemsFromOther + sharedFromOther) * 100) / 100;

    const myTotalExpenses: number = Math.floor((myExpensesFromOther + myExpensesFromMe) * 100) / 100;


    const rejectedFromMe: number = Calculator.calcRejectedExpenses(myReceipts);
    const result: number = Math.floor((myTotalExpenses - myReceiptsExpenses) * 100) / 100;

    function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
        uploadFile(e.target.files, isFirst).then(() => {
            e.target.value = '';
        });
    }

    return (
        <div className={[styles.personCard].join(' ')}>
            <input className={[styles.personName].join(' ')} type={'text'} value={myName} placeholder={'Name'} onChange={(e) => {
                setPersonName(e.currentTarget.value, isFirst);
            }} />
            <div className={[styles.personHeader].join(' ')}>


                <button className={[styles.fancyButton].join('')} onClick={() => {
                    if (typeof window !== null && typeof window !== undefined) {
                        window.document.getElementById(isFirst ? 'firstUpload' : 'secondUpload')!.click()
                    }
                }}>
                    Upload Data
                </button>
                <button disabled={myReceipts.length === 0 && otherReceipts.length === 0} className={[styles.fancyButton].join('')} onClick={() => {

                    const resultData: IResult = {
                        payerName: result <= 0 ? otherName : myName,
                        receiverName: result <= 0 ? myName : otherName,
                        payerExpenses: result <= 0 ? otherReceiptsExpenses : myReceiptsExpenses,
                        receiverExpenses: result <= 0 ? myReceiptsExpenses : otherReceiptsExpenses,
                        sharedFromPayer: result <= 0 ? sharedFromOther : sharedFromMe,
                        sharedFromReceiver: result <= 0 ? sharedFromMe : sharedFromOther,
                        payerItemsFromPayer: result <= 0 ? otherItemsFromOther : myItemsFromMe,
                        receiverItemsFromReceiver: result <= 0 ? myItemsFromMe : otherItemsFromOther,
                        receiverItemsFromPayer: result <= 0 ? myItemsFromOther : otherItemsFromMe,
                        payerItemsFromReceiver: result <= 0 ? otherItemsFromMe : myItemsFromOther,
                        result: result
                    };

                    DataParser.downloadEXCEL('Expenses_' + moment().format('DD_MM_YYYY'), myName, otherName, myReceipts, otherReceipts, resultData);
                }}>
                    Export Expenses
                </button>
                <button className={[styles.fancyButton].join('')} onClick={() => {
                    setReceipts([], isFirst);
                }}>
                    Clear Data
                </button>


                <input type='file' id={isFirst ? 'firstUpload' : 'secondUpload'} accept='.csv' multiple={true} onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>
            <ReceiptsOverview
                myName={myName}
                otherName={otherName}
                myReceiptsExpenses={myReceiptsExpenses}
                myItemsFromMe={myItemsFromMe}
                sharedFromMe={sharedFromMe}
                myExpensesFromMe={myExpensesFromMe}
                myItemsFromOther={myItemsFromOther}
                sharedFromOther={sharedFromOther}
                myExpensesFromOther={myExpensesFromOther}
                myTotalExpenses={myTotalExpenses}
                rejectedFromMe={rejectedFromMe}
                result={result}
            />

            <div className={[styles.personAddItemWrapper].join(' ')}>
                <input placeholder='Store' type='text' value={newItemStore} onChange={(e) => { setNewItemStore(e.target.value) }} />
                <input placeholder='Name' type='text' value={newItemName} onChange={(e) => { setNewItemName(e.target.value) }} />
                <div className={[styles.numberWrapper].join(' ')}>
                    <input placeholder='Amount' type='number' value={Number.isNaN(newItemAmount) ? '' : newItemAmount} step="1" min="1" onChange={(e) => { setNewItemAmount(e.target.valueAsNumber) }} />
                    <input placeholder='Price' type='number' value={Number.isNaN(newItemPrice) ? '' : newItemPrice} onChange={(e) => { setNewItemPrice(e.target.valueAsNumber) }} />
                </div>
                <button className={[styles.fancyButton].join('')} onClick={() => {
                    if (newItemStore === '' || newItemName === '' || newItemPrice === 0 || newItemAmount < 0.01 || !Number.isInteger(newItemAmount)) { return }
                    const tmpReceipts: IReceipt[] = myReceipts.slice(0);
                    const newItem: IReceiptItem = {
                        name: newItemName,
                        price: newItemPrice,
                        amount: newItemAmount,
                        isMine: false,
                        isShared: true,
                        isRejected: false,
                        category: DataParser.DEFAULT_CATEGORY
                    }

                    const newReceipt: IReceipt = {
                        store: newItemStore,
                        owner: myName,
                        totalPrice: newItemPrice,
                        items: [newItem],
                        categoryForAllItems: DataParser.DEFAULT_CATEGORY,
                        isAllShared: false,
                        isAllRejected: false,
                        isAllMine: false
                    }

                    tmpReceipts.push(newReceipt)

                    setReceipts([...tmpReceipts], isFirst)
                    setNewItemStore('');
                    setNewItemName('');
                    setNewItemPrice(NaN);
                    setNewItemAmount(NaN);
                }}>+ Add</button>

            </div>
        </div>
    );
}
