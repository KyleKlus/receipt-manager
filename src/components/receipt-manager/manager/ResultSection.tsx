/** @format */
import Card from '@/components/Card';
import styles from '@/styles/components/receipt-manager/manager/ResultSection.module.css';
import ResultCard from './ResultCard';
import * as Calculator from '@/handlers/Calculator';
import * as DataParser from '@/handlers/DataParser';
import { IReceipt } from '@/interfaces/data/IReceipt';
import { IResult } from '@/interfaces/data/IResult';
import moment from 'moment';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { useRouter } from 'next/router';
import { RedirectPathOptions, redirectPaths } from '@/context/AuthContext';


interface IResultSectionProps {
  setResultReady: (state: boolean) => void;
}

export default function ResultSection(props: React.PropsWithChildren<IResultSectionProps>) {
  const accountingDB: IAccountingDataBaseContext = useAccountingDB();
  const router = useRouter();

  return <div className={[].join(' ')}>
    <Card className={[styles.resultSection].join(' ')}>
      <div className={[styles.resultSectionHeader].join(' ')}>
        <h2>Result</h2>
        <div className={[styles.resultSectionHeaderControls].join(' ')}>
          <button onClick={() => { props.setResultReady(false) }}>Back</button>
          <button onClick={() => {
            // TODO: Fix caveman implementation
            const myName: string = accountingDB.firstName;
            const otherName: string = accountingDB.secondName;

            const myUid: string = accountingDB.firstUid;
            const otherUid: string = accountingDB.secondUid;

            const myReceipts: IReceipt[] = accountingDB.firstReceipts;
            const otherReceipts: IReceipt[] = accountingDB.secondReceipts;

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

            DataParser.downloadEXCEL('Expenses_' + moment().format('DD_MM_YYYY'), myName, otherName, myUid, otherUid, myReceipts, otherReceipts, resultData);
          }}>Export data</button>
          <button onClick={() => { router.push(redirectPaths[RedirectPathOptions.DashBoardPage]) }}>Close</button>
        </div>
      </div>
      <div className={[styles.resultSectionContent].join(' ')}>
        <ResultCard isFirstPerson={true} />
        <ResultCard isFirstPerson={false} />
      </div>
    </Card>
  </div>;
}
