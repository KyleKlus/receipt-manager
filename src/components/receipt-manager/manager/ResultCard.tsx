/** @format */
import Card from '@/components/Card';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import * as Calculator from '@/handlers/Calculator';
import { IReceipt } from '@/interfaces/data/IReceipt';
import { IResult } from '@/interfaces/data/IResult';
import styles from '@/styles/components/receipt-manager/manager/ResultCard.module.css';

export default function ResultCard(props: {
    isFirstPerson: boolean
}) {
    const accountingDB: IAccountingDataBaseContext = useAccountingDB();
    const billDB: IBillDataBaseContext = useBillDB();
    const userDB: IUserDataBaseContext = useUserDB();
    const auth: IAuthContext = useAuth();

    const myName: string = props.isFirstPerson?accountingDB.firstName: accountingDB.secondName;
    const otherName: string = !props.isFirstPerson?accountingDB.firstName: accountingDB.secondName;

    const myUid: string = props.isFirstPerson?accountingDB.firstUid:accountingDB.secondUid;
    const otherUid: string = !props.isFirstPerson?accountingDB.firstUid:accountingDB.secondUid;

    const myReceipts: IReceipt[] = props.isFirstPerson?accountingDB.firstReceipts:accountingDB.secondReceipts;
    const otherReceipts: IReceipt[] = !props.isFirstPerson?accountingDB.firstReceipts:accountingDB.secondReceipts;

    const myPaidExpenses: number = Calculator.calcReceiptsExpenses(myReceipts);
    const otherPaidExpenses: number = Calculator.calcReceiptsExpenses(otherReceipts);

    const myPersonalExpensesFromMe: number = Calculator.calcPersonalExpensesFromMyReceipts(myReceipts, myUid);
    const otherPersonalExpensesFromMe: number = Calculator.calcPersonalExpensesFromMyReceipts(myReceipts, otherUid);

    const myPersonalExpensesFromOther: number = Calculator.calcPersonalExpensesFromOtherReceipts(otherReceipts, myUid);
    const otherPersonalExpensesFromOther: number = Calculator.calcPersonalExpensesFromOtherReceipts(otherReceipts, otherUid);

    const mySharedExpensesFromMe: number = Calculator.calcSharedExpensesFromMyReceipts(myReceipts, myUid);
    const otherSharedExpensesFromMe: number = mySharedExpensesFromMe;

    const mySharedExpensesFromOther: number = Calculator.calcSharedExpensesFromOtherReceipts(otherReceipts, myUid);
    const otherSharedExpensesFromOther: number = mySharedExpensesFromOther;

    const myExpensesFromMe = myPersonalExpensesFromMe + mySharedExpensesFromMe;
    const otherExpensesFromMe = otherPersonalExpensesFromMe + otherSharedExpensesFromMe;

    const myExpensesFromOther = myPersonalExpensesFromOther + mySharedExpensesFromOther;
    const otherExpensesFromOther = otherPersonalExpensesFromOther + otherSharedExpensesFromOther;

    const myTotalExpenses = myExpensesFromMe + myExpensesFromOther;
    const otherTotalExpenses = otherExpensesFromMe + otherExpensesFromOther;

    const myOverhang = Math.floor((myPaidExpenses - myTotalExpenses) * 100) / 100;
    const otherOverhang = Math.floor((otherPaidExpenses - otherTotalExpenses) * 100) / 100;

    const result: number = Math.floor((myTotalExpenses - myPaidExpenses) * 100) / 100;

    const isPayerMe = () => {
        return myOverhang < 0;
    }

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
                            <div>{myPersonalExpensesFromMe.toFixed(2)} €</div>
                        </div>
                        <div className={[styles.personTableSum].join(' ')}>
                            <div>Shared items: </div>
                            <div>{mySharedExpensesFromMe.toFixed(2)} €</div>
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
                            <div>{myPersonalExpensesFromOther.toFixed(2)} €</div>
                        </div>
                        <div className={[styles.personTableSum].join(' ')}>
                            <div>Shared items: </div>
                            <div>{mySharedExpensesFromOther.toFixed(2)} €</div>
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
                    <div>{myTotalExpenses.toFixed(2)} €</div>
                </div>
                <div className={[styles.personTableSum].join(' ')}>
                    <div>{myName} paid: </div>
                    <div>{-myPaidExpenses.toFixed(2)} €</div>
                </div>
                <hr />
                <div className={[styles.personTableSum].join(' ')}>
                    <div>Total result: </div>
                    <div>{myOverhang.toFixed(2)} €</div>
                </div>
                <hr />
                <hr />
                <div className={[styles.personTableSum].join(' ')}>
                    {isPayerMe()
                        ? <div>{myName} needs to pay: </div>
                        : <div>{myName} has paid too much: </div>
                    }
                    <div>{Math.abs(result).toFixed(2)} €</div>
                </div>
                <hr />
            </div>
        </Card>
    );
}
