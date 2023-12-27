/** @format */
import Card from '@/components/Card';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import * as Calculator from '@/handlers/Calculator';
import { IReceipt } from '@/interfaces/data/IReceipt';
import styles from '@/styles/components/receipt-manager/manager/ResultCard.module.css';

export default function ResultCard(props: {
    isFirstPerson: boolean
}) {
    const accountingDB: IAccountingDataBaseContext = useAccountingDB();
    const billDB: IBillDataBaseContext = useBillDB();
    const userDB: IUserDataBaseContext = useUserDB();
    const auth: IAuthContext = useAuth();

    const myName: string = props.isFirstPerson ? accountingDB.firstName : accountingDB.secondName;
    const otherName: string = !props.isFirstPerson ? accountingDB.firstName : accountingDB.secondName;

    const myUid: string = props.isFirstPerson ? accountingDB.firstUid : accountingDB.secondUid;
    const otherUid: string = !props.isFirstPerson ? accountingDB.firstUid : accountingDB.secondUid;

    const myReceipts: IReceipt[] = props.isFirstPerson ? accountingDB.firstReceipts : accountingDB.secondReceipts;
    const otherReceipts: IReceipt[] = !props.isFirstPerson ? accountingDB.firstReceipts : accountingDB.secondReceipts;

    const myReceiptsExpenses: number = Calculator.calcReceiptsExpenses(myReceipts);
    const otherReceiptsExpenses: number = Calculator.calcReceiptsExpenses(otherReceipts);

    const myItemsFromMe: number = Calculator.calcPersonalExpenses(myReceipts, myUid);
    const otherItemsFromOther: number = Calculator.calcPersonalExpenses(otherReceipts, otherUid);
    const sharedFromMe: number = Calculator.calcSharedExpenses(myReceipts, myUid, otherUid);
    const myExpensesFromMe: number = Math.floor((myItemsFromMe + sharedFromMe) * 100) / 100;

    const myItemsFromOther: number = Calculator.calcRejectedExpenses(otherReceipts, otherUid, myUid);
    const otherItemsFromMe: number = Calculator.calcRejectedExpenses(myReceipts, myUid, otherUid);
    const sharedFromOther: number = Calculator.calcSharedExpenses(otherReceipts, myUid, otherUid);
    const myExpensesFromOther: number = Math.floor((myItemsFromOther + sharedFromOther) * 100) / 100;

    const myTotalExpenses: number = Math.floor((myExpensesFromOther + myExpensesFromMe) * 100) / 100;


    const rejectedFromMe: number = Calculator.calcRejectedExpenses(myReceipts, otherUid, myUid);
    const result: number = Math.floor((myTotalExpenses - myReceiptsExpenses) * 100) / 100;

    return (
        <Card className={[styles.receiptsOverviewCard].join(' ')}>
            <h2>{myName}&apos;s Result</h2>
            <div className={[styles.receiptsOverview].join(' ')}>
                <div className={[styles.personTableHorizontalSplit].join(' ')}>
                    <div className={[styles.personTableSplit].join(' ')}>
                        <div className={[styles.personTableSplitHeader].join(' ')}>{myName}&#39;s Receipts</div>
                        <hr />
                        <div className={[styles.personTableSum].join(' ')}>
                            <div>Personal items: </div>
                            <div>{myItemsFromMe.toFixed(2)} €</div>
                        </div>
                        <div className={[styles.personTableSum].join(' ')}>
                            <div>Shared items: </div>
                            <div>{sharedFromMe.toFixed(2)} €</div>
                        </div>
                        <hr />
                        <hr />
                        <div className={[styles.personTableSum].join(' ')}>
                            <div>Expenses: </div>
                            <div>{myExpensesFromMe.toFixed(2)} €</div>
                        </div>
                    </div>
                    <div className={[styles.personTableSplit].join(' ')}>
                        <div className={[styles.personTableSplitHeader].join(' ')}>{otherName}&#39;s Receipts</div>
                        <hr />
                        <div className={[styles.personTableSum].join(' ')}>
                            <div>Personal items: </div>
                            <div>{myItemsFromOther.toFixed(2)} €</div>
                        </div>
                        <div className={[styles.personTableSum].join(' ')}>
                            <div>Shared items: </div>
                            <div>{sharedFromOther.toFixed(2)} €</div>
                        </div>
                        <hr />
                        <hr />
                        <div className={[styles.personTableSum].join(' ')}>
                            <div>Expenses: </div>
                            <div>{myExpensesFromOther.toFixed(2)} €</div>
                        </div>
                    </div>
                </div>
                <hr />
                <hr />
                <div className={[styles.personTableSum].join(' ')}>
                    <div>{myName}&#39;s total expenses: </div>
                    <div>{myTotalExpenses} €</div>
                </div>
                <div className={[styles.personTableSum].join(' ')}>
                    <div>{myName} paid: </div>
                    <div>{-myReceiptsExpenses.toFixed(2)} €</div>
                </div>
                <hr />
                <div className={[styles.personTableSum].join(' ')}>
                    <div>Total result: </div>
                    <div>{result.toFixed(2)} €</div>
                </div>
                <hr />
                <hr />
                <div className={[styles.personTableSum].join(' ')}>
                    {result <= 0
                        ? <div>{myName} has paid too much: </div>
                        : <div>{myName} needs to pay: </div>
                    }
                    <div>{Math.abs(result).toFixed(2)} €</div>
                </div>
                <hr />
            </div>
        </Card>
    );
}
