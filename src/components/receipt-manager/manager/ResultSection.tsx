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
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { useEffect, useState } from 'react';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';


interface IResultSectionProps {
  className?: string;
  isResultReady: boolean;
  setResultReady: (state: boolean) => void;
}

export default function ResultSection(props: React.PropsWithChildren<IResultSectionProps>) {

  const authContext: IAuthContext = useAuth();
  const userDBContext: IUserDataBaseContext = useUserDB();
  const yearDBContext: IYearDataBaseContext = useYearDB();
  const monthDBContext: IMonthDataBaseContext = useMonthDB();
  const accountingDB: IAccountingDataBaseContext = useAccountingDB();

  const [isResultReady, setIsResultReady] = useState(props.isResultReady);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const billDB: IBillDataBaseContext = useBillDB();

  const router = useRouter();

  useEffect(() => {
    setIsResultReady(props.isResultReady)
    if (props.isResultReady) {
      setIsLoadingStats(true);
      fetchCurrentBillStats();
    }
  }, [props.isResultReady])

  async function fetchCurrentBillStats() {
    if (yearDBContext.currentYear === undefined || monthDBContext.currentMonth === undefined || billDB.currentBill === undefined) {
      setIsLoadingStats(false);
      return;
    }
    const updatedBill = await billDB.updateBillStats(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, billDB.currentBill, false);

    if (updatedBill !== undefined) {
      billDB.saveCurrentBill(updatedBill);
    }

    setIsLoadingStats(false);
  }

  if (billDB.currentBill === undefined) {
    return <div></div>
  }

  return (
    <Card className={[styles.resultSection, props.className].join(' ')}>
      <div className={[styles.resultSectionHeader].join(' ')}>
        <div className={[styles.resultSectionHeaderTitleWrapper].join(' ')}>
          <h2>Result 🔬</h2>
          <h4 >{billDB.currentBill?.date.format('DD.MM.YYYY')}</h4>
        </div>
        <div className={[styles.resultSectionHeaderControls].join(' ')}>
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
          <hr />
          <button onClick={() => { props.setResultReady(false) }}>Back</button>
          <button onClick={() => { router.push(redirectPaths[RedirectPathOptions.DashBoardPage]) }}>Close</button>
        </div>
      </div>
      <div className={[styles.resultSectionContent].join(' ')}>
        <div className={[styles.resultSectionContentSplit].join(' ')}>
          <ResultCard isFirstPerson={true} />
          <ResultCard isFirstPerson={false} />
        </div>
        {!isLoadingStats &&
          <Card className={[styles.resultSectionContentCard, styles.resultFunFacts].join(' ')}>
            <div>
              Most common category:
              <div>
                {DataParser.getNameOfCategory(billDB.currentBill?.mostCommonCategory)}
              </div>
            </div>
            <div>
              Most expensive item:
              <div>
                {billDB.currentBill.mostExpensiveItem?.name} | {billDB.currentBill.mostExpensiveItem?.price} €
              </div>
            </div>

            <div>
              Most expensive receipt:
              <div>
                {billDB.currentBill.mostExpensiveReceipt?.store} | {billDB.currentBill.mostExpensiveReceipt?.totalPrice} €
              </div>
            </div>
          </Card>
        }
        {!isLoadingStats &&
          <Card className={[styles.resultSectionContentCard, styles.resultStats].join(' ')}>
            {billDB.currentBill?.categoryMetaData.map((category, index) => {
              return (<Card key={index}>
                <h4>
                  {DataParser.getNameOfCategory(category.category)}
                </h4>
                <br />
                <p>Item amount: {category.itemAmount}</p>
                <p>Item entries: {category.itemEntriesCount}</p>
                <p>Total price: {category.totalPrice.toFixed(2)} €</p>
              </Card>);
            })}
          </Card>
        }
      </div>
    </Card>
  );
}
