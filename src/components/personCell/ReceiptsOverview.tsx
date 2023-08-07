/** @format */
import styles from '@/styles/components/personCell/ReceiptsOverview.module.css';

export default function ReceiptsOverview(props: {
    myName: string,
    otherName: string,
    myReceiptsExpenses: number;

    myItemsFromMe: number;
    sharedFromMe: number;
    myExpensesFromMe: number;

    myItemsFromOther: number;
    sharedFromOther: number;
    myExpensesFromOther: number

    myTotalExpenses: number;

    rejectedFromMe: number;

    result: number,
}) {
    const {
        myName,
        otherName,
        myReceiptsExpenses,

        myItemsFromMe,
        sharedFromMe,
        myExpensesFromMe,

        myItemsFromOther,
        sharedFromOther,
        myExpensesFromOther,

        myTotalExpenses,

        rejectedFromMe,

        result,
    } = props;

    return (
        <div className={[styles.receiptsOverview].join(' ')}>
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s personal stuff from {myName}&apos s receipts: </div>
                <div>{myItemsFromMe} €</div>
            </div>
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s share from the shared items of {myName}&apos s receipts: </div>
                <div>{sharedFromMe} €</div>
            </div>
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s expenses from {myName}&apos s receipts: </div>
                <div>{myExpensesFromMe} €</div>
            </div>
            <hr />
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s personal stuff from {otherName}&apos s receipts: </div>
                <div>{myItemsFromOther} €</div>
            </div>
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s share from the shared items of {otherName}&apos s receipts: </div>
                <div>{sharedFromOther} €</div>
            </div>
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s expenses from {otherName}&apos s receipts: </div>
                <div>{myExpensesFromOther} €</div>
            </div>
            <hr />
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s expenses from {myName}&apos s receipts: </div>
                <div>{myExpensesFromMe} €</div>
            </div>
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s expenses from {otherName}&apos s receipts: </div>
                <div>{myExpensesFromOther} €</div>
            </div>
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s total expenses: </div>
                <div>{myTotalExpenses} €</div>
            </div>
            <hr />
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&apos s total expenses: </div>
                <div>{myTotalExpenses} €</div>
            </div>
            <div className={[styles.personTableSum].join(' ')}>
                <div>{otherName}&apos s personal stuff from {myName}&apos s receipts: </div>
                <div>{+rejectedFromMe} €</div>
            </div>
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName} paid: </div>
                <div>{-myReceiptsExpenses} €</div>
            </div>
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                {result <= 0
                    ? <div>{myName} has paid the following amount too much: </div>
                    : <div>{myName} needs to pay the following: </div>
                }
                <div>{result} €</div>
            </div>
            <hr />
        </div>
    );
}
