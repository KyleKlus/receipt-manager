/** @format */
import styles from '@/styles/components/receipt-manager/manager/ReceiptManager.module.css';
import { useEffect, useState } from 'react';
import { IReceipt } from '@/interfaces/data/IReceipt';
import * as CSVParser from '@/handlers/DataParser';
import PersonCard from '@/components/receipt-manager/personCell/PersonCard';
import ReceiptsTable from '@/components/receipt-manager/personCell/ReceiptsTable';
import { Category } from '@/handlers/DataParser';
import { IReceiptItem } from '@/interfaces/data/IReceiptItem';
import UploadSection from './UploadSection';
import ResultSection from './ResultSection';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';

interface IReceiptManagerProps {
    billDate: string;
    token: string
}

export default function ReceiptManager(props: React.PropsWithChildren<IReceiptManagerProps>) {
    const authContext: IAuthContext = useAuth();
    const userDBContext: IUserDataBaseContext = useUserDB();
    const billDBContext: IBillDataBaseContext = useBillDB();
    const accountingDBContext: IAccountingDataBaseContext = useAccountingDB();

    const [isResultReady, setIsResultReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isLoading) {
            loadData();
        }
    })

    async function loadData() {
        if (authContext.user === null) { return; }
        if (authContext.user.displayName == null) { return; }

        accountingDBContext.saveName(authContext.user.displayName, true);
        const secondPersonName: string = await userDBContext.getUserNameByToken(authContext.user, props.token);
        accountingDBContext.saveName(secondPersonName, false);

        const receipts = await accountingDBContext.getReceipts(authContext.user, props.token, props.billDate);
        const firstReceipts = receipts.filter(receipt => receipt.payedByUid === authContext.user?.uid);
        accountingDBContext.saveReceipts(firstReceipts, true);

        const secondReceipts = receipts.filter(receipt => receipt.payedByUid !== authContext.user?.uid);
        accountingDBContext.saveReceipts(secondReceipts, false);

        setIsLoading(false);
    }

    // function selectCategory(receiptNum: number, itemNum: number, isFrist: boolean, selectedCategory: Category) {
    //     const updatedList: IReceipt[] = isFrist ? firstReceipts : secondReceipts;

    //     updatedList[receiptNum].categoryForAllItems = Category.None;
    //     updatedList[receiptNum].items[itemNum].category = selectedCategory;

    //     isFrist ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
    // }

    // function toggleRejectItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
    //     const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    //     updatedList[receiptNum].isAllRejected = false;
    //     updatedList[receiptNum].isAllShared = false;
    //     updatedList[receiptNum].isAllMine = false;

    //     if (updatedList[receiptNum].items[itemNum].isMine === true) {
    //         updatedList[receiptNum].items[itemNum].isMine = false;
    //     };
    //     updatedList[receiptNum].items[itemNum].isRejected = !updatedList[receiptNum].items[itemNum].isRejected;
    //     updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isRejected;


    //     isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
    // }

    // function toggleShareItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
    //     const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;
    //     updatedList[receiptNum].isAllRejected = false;
    //     updatedList[receiptNum].isAllShared = false;
    //     updatedList[receiptNum].isAllMine = false;

    //     if (updatedList[receiptNum].items[itemNum].isRejected === true && !updatedList[receiptNum].items[itemNum].isShared === true) {
    //         updatedList[receiptNum].items[itemNum].isRejected = false;
    //     };
    //     updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isShared;
    //     updatedList[receiptNum].items[itemNum].isMine = updatedList[receiptNum].items[itemNum].isShared && updatedList[receiptNum].items[itemNum].isRejected;

    //     isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
    // }

    // function toggleMyItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
    //     const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    //     updatedList[receiptNum].isAllRejected = false;
    //     updatedList[receiptNum].isAllShared = false;
    //     updatedList[receiptNum].isAllMine = false;

    //     updatedList[receiptNum].items[itemNum].isMine = !updatedList[receiptNum].items[itemNum].isMine;
    //     updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isMine;
    //     updatedList[receiptNum].items[itemNum].isRejected = false;

    //     isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
    // }

    // function selectCategoryForAllItems(receiptNum: number, isFrist: boolean, selectedCategory: Category) {
    //     const updatedList: IReceipt[] = isFrist ? firstReceipts.slice(0) : secondReceipts.slice(0);

    //     updatedList[receiptNum].categoryForAllItems = selectedCategory;

    //     const tmpItems: IReceiptItem[] = updatedList[receiptNum].items.slice(0);

    //     tmpItems.forEach((item) => {
    //         item.category = selectedCategory;
    //     })

    //     updatedList[receiptNum].items = tmpItems;

    //     console.log(updatedList[receiptNum].items[0]);


    //     isFrist ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
    // }

    // function toggleAllRejectedItems(receiptNum: number, isFirstList: boolean) {
    //     const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    //     if (updatedList[receiptNum].isAllMine === true) {
    //         updatedList[receiptNum].isAllMine = false;
    //     };
    //     updatedList[receiptNum].isAllRejected = !updatedList[receiptNum].isAllRejected;
    //     updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllRejected;


    //     updatedList[receiptNum].items.forEach((item) => {
    //         item.isRejected = updatedList[receiptNum].isAllRejected;
    //         item.isShared = updatedList[receiptNum].isAllShared;
    //         item.isMine = updatedList[receiptNum].isAllMine;
    //     });

    //     isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
    // }

    // function toggleAllSharedItems(receiptNum: number, isFirstList: boolean) {
    //     const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    //     if (updatedList[receiptNum].isAllRejected === true && !updatedList[receiptNum].isAllShared === true) {
    //         updatedList[receiptNum].isAllRejected = false;
    //     };
    //     updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllShared;
    //     updatedList[receiptNum].isAllMine = updatedList[receiptNum].isAllShared && updatedList[receiptNum].isAllRejected;

    //     updatedList[receiptNum].items.forEach((item) => {
    //         item.isRejected = updatedList[receiptNum].isAllRejected;
    //         item.isShared = updatedList[receiptNum].isAllShared;
    //         item.isMine = updatedList[receiptNum].isAllMine;
    //     });

    //     isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
    // }

    // function toggleAllMyItems(receiptNum: number, isFirstList: boolean) {
    //     const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    //     updatedList[receiptNum].isAllMine = !updatedList[receiptNum].isAllMine;
    //     updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllMine;
    //     updatedList[receiptNum].isAllRejected = false;

    //     updatedList[receiptNum].items.forEach((item) => {
    //         item.isRejected = updatedList[receiptNum].isAllRejected;
    //         item.isShared = updatedList[receiptNum].isAllShared;
    //         item.isMine = updatedList[receiptNum].isAllMine;
    //     });

    //     isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
    // }

    // async function uploadFile(files: FileList | null, isFirst: boolean): Promise<void> {
    //     if (files !== null && files !== undefined) {
    //         let receipts: IReceipt[] = [];

    //         for (let i = 0; i < files.length; i++) {
    //             receipts = receipts.concat(await CSVParser.parseFileToReceipts(files[i], isFirst ? firstPersonName : secondPersonName));
    //         }
    //         if (isFirst) {
    //             setFirstReceipts([...receipts])
    //         } else {
    //             setSecondReceipts([...receipts])
    //         }
    //     }
    // }

    // function setReceipts(receipts: IReceipt[], isFirst: boolean) {
    //     if (isFirst) {
    //         setFirstReceipts([...receipts]);
    //     } else {
    //         setSecondReceipts([...receipts]);
    //     }
    // }

    return (
        <div className={[styles.receiptManager].join(' ')}>
            {!isLoading &&
                <>
                    {!isResultReady
                        ? <UploadSection setResultReady={setIsResultReady} />
                        : <ResultSection setResultReady={setIsResultReady} />
                    }
                </>
            }
        </div>
    );
}
