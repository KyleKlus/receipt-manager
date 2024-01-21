/** @format */
import Card from '@/components/container/Card';
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
import IBill from '@/interfaces/data/IBill';


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
    let updatedBill: IBill | undefined = billDB.currentBill;
    updatedBill = await billDB.updateBillStats(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, billDB.currentBill, false);

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

            const resultData: IResult = {
              payerName: isPayerMe() ? myName : otherName,
              receiverName: !isPayerMe() ? myName : otherName,
              payerPaidExpenses: !isPayerMe() ? otherPaidExpenses : myPaidExpenses,
              receiverPaidExpenses: isPayerMe() ? otherPaidExpenses : myPaidExpenses,
              sharedFromPayer: isPayerMe() ? mySharedExpensesFromMe : otherSharedExpensesFromOther,
              sharedFromReceiver: !isPayerMe() ? mySharedExpensesFromMe : otherSharedExpensesFromOther,
              payerItemsFromPayer: isPayerMe() ? myPersonalExpensesFromMe : otherPersonalExpensesFromOther,
              receiverItemsFromReceiver: !isPayerMe() ? myPersonalExpensesFromMe : otherPersonalExpensesFromOther,
              receiverItemsFromPayer: !isPayerMe() ? myPersonalExpensesFromOther : otherPersonalExpensesFromMe,
              payerItemsFromReceiver: isPayerMe() ? myPersonalExpensesFromOther : otherPersonalExpensesFromMe,
              receiverOverhang: isPayerMe() ? otherOverhang : myOverhang
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
