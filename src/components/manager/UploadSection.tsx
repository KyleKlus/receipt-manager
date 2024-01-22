/** @format */
import Card from '@/lib/container/Card';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import styles from '@/styles/components/manager/UploadSection.module.css';
import { ChangeEvent, useEffect, useState } from 'react';

import * as DataParser from '@/handlers/DataParser';
import Receipt from './Receipt/Receipt';
import { IReceipt } from '@/interfaces/data/IReceipt';
import AddReceipt from './Receipt/AddReceipt';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import { getBill, updateBill } from '@/services/fireStores/firebaseBillStore';

interface IUploadSectionProps {
  className?: string
  setResultReady: (state: boolean) => void;
}

export default function UploadSection(props: React.PropsWithChildren<IUploadSectionProps>) {
  const accountingDB: IAccountingDataBaseContext = useAccountingDB();
  const billDB: IBillDataBaseContext = useBillDB();
  const userDB: IUserDataBaseContext = useUserDB();
  const yearDBContext: IYearDataBaseContext = useYearDB();
  const monthDBContext: IMonthDataBaseContext = useMonthDB();
  const auth: IAuthContext = useAuth();

  const [isInEditMode, setEditMode] = useState(false);
  const [isFirstPersonMode, setIsFirstPersonMode] = useState(true);
  const [shouldLoadReceipts, setShouldLoadReceipts] = useState(true);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    setProgress(0);
    setIsLoading(true);
    const files = e.target.files;
    if (
      files === null ||
      auth.user === null ||
      billDB.currentBill === undefined ||
      yearDBContext.currentYear === undefined ||
      monthDBContext.currentMonth === undefined
    ) { return };
    const user = auth.user;
    const token = userDB.selectedConnection;
    const date = billDB.currentBill.name;
    const year = yearDBContext.currentYear.name;
    const month = monthDBContext.currentMonth.name;
    const ownerUid = isFirstPersonMode ? accountingDB.firstUid : accountingDB.secondUid;
    const shareUid = !isFirstPersonMode ? accountingDB.firstUid : accountingDB.secondUid;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const receipts = await DataParser.parseFileToReceipts(file, ownerUid, shareUid);
      for (let j = 0; j < receipts.length; j++) {
        const receipt = receipts[j];
        await accountingDB.addReceipt(user, token, year, month, date, receipt);
        setProgress(((index + 1 + j + 1) / (files.length + receipts.length)) * 100);
      }
      const oldReceipts = isFirstPersonMode ? accountingDB.firstReceipts : accountingDB.secondReceipts;
      accountingDB.saveReceipts(oldReceipts.concat(receipts), isFirstPersonMode);
    }

    const currentBill = await getBill(user, token, year, month, date);
    if (currentBill !== undefined) {
      currentBill.needsRefresh = true;
      await updateBill(user, token, year, month, currentBill);
    }

    e.target.value = '';
    setIsLoading(false);
    setProgress(0);
  }

  useEffect(() => {
    if (shouldLoadReceipts && !isLoadingReceipts) {
      loadReceipts(isFirstPersonMode);
    }
  })

  async function loadReceipts(isFirst: boolean) {
    setShouldLoadReceipts(false);
    if (auth.user === null || billDB.currentBill === undefined ||
      yearDBContext.currentYear === undefined ||
      monthDBContext.currentMonth === undefined) { return; }
    setIsLoadingReceipts(true);
    setProgress(0);

    const loadByUid = isFirst ? accountingDB.firstUid : accountingDB.secondUid;

    const receipts = await accountingDB.getReceiptsByUid(auth.user, userDB.selectedConnection,
      yearDBContext.currentYear.name,
      monthDBContext.currentMonth.name,
      billDB.currentBill.name, loadByUid, true)

    setProgress(50);

    const updatedReceipts = await updateReceiptStats(receipts);
    setProgress(75);

    accountingDB.saveReceipts(updatedReceipts, isFirst);
    setProgress(100);
    setIsLoadingReceipts(false);
  }

  async function updateReceiptStats(receipts: IReceipt[]): Promise<IReceipt[]> {
    if (auth.user === null || billDB.currentBill === undefined ||
      yearDBContext.currentYear === undefined ||
      monthDBContext.currentMonth === undefined) { return []; }

    for (let index = 0; index < receipts.length; index++) {
      const receipt = receipts[index];
      const updatedReceipt = await accountingDB.updateReceiptStats(auth.user, userDB.selectedConnection,
        yearDBContext.currentYear.name,
        monthDBContext.currentMonth.name,
        billDB.currentBill.name, receipt);

      if (updatedReceipt !== undefined) {
        receipts[index] = updatedReceipt;
      }
    }

    return receipts;
  }

  return (
    <Card className={[styles.uploadSection, props.className].join(' ')}>
      <div className={[styles.uploadSectionHeader].join(' ')}>
        <div className={[styles.uploadSectionHeaderTitleWrapper].join(' ')}>
          <h2>{isFirstPersonMode ? accountingDB.firstName : accountingDB.secondName}&apos;s Receipts 📃</h2>
          <h4 onChange={(e) => {
            //TODO: make bill date editable
            // contentEditable={isInEditMode}
            // const currentBill = billDB.currentBill;
            // if (currentBill === undefined) { return; }
          }}>{billDB.currentBill?.date.format('DD.MM.YYYY')}</h4>
        </div>

        <div className={[styles.uploadSectionHeaderControls].join(' ')}>
          <div className={[styles.uploadSectionHeaderModeWrapper].join(' ')}>
            <button disabled={isInEditMode} onClick={() => {
              setEditMode(true);
            }}>Edit Mode 🛠️</button>
            <button disabled={!isInEditMode} onClick={() => {
              setEditMode(false);
            }}>Accounting 🧾</button>
          </div>
          <hr />
          <button onClick={() => {
            if (typeof window !== null && typeof window !== undefined) {
              window.document.getElementById(isFirstPersonMode ? 'firstUpload' : 'secondUpload')!.click()
            }
          }}
            className={[].join(' ')}>Upload data</button>
          <button
            onClick={async () => {
              if (billDB.currentBill === undefined ||
                yearDBContext.currentYear === undefined ||
                monthDBContext.currentMonth === undefined) {
                return;
              }
              setIsLoading(true);
              setProgress(0);
              const user = auth.user;
              const token = userDB.selectedConnection;
              const date = billDB.currentBill.name;
              const year = yearDBContext.currentYear.name;
              const month = monthDBContext.currentMonth.name;
              const outDatedReceipts = isFirstPersonMode ? accountingDB.firstReceipts : accountingDB.secondReceipts;
              const receipts = isFirstPersonMode ? accountingDB.firstReceipts : accountingDB.secondReceipts;
              accountingDB.saveReceipts([], isFirstPersonMode);

              let isSuccessful = true;

              for (let index = 0; index < receipts.length; index++) {
                const receipt = receipts[index];
                isSuccessful = await accountingDB.deleteReceipt(user, token, year, month, date, receipt.receiptId);
                setProgress(((index + 1) / receipts.length) * 100);
                if (!isSuccessful) {
                  accountingDB.saveReceipts([...outDatedReceipts], isFirstPersonMode);
                  // TODO: Implement a better receipt savemode
                }
              }

              const updatedBill = billDB.currentBill;
              updatedBill.needsRefresh = true;
              await billDB.updateBill(user, token, year, month, updatedBill);

              setIsLoading(false);
              setProgress(0);
            }}
          >❌ Data</button>
          <hr />
          <button onClick={() => {
            setShouldLoadReceipts(isFirstPersonMode ? accountingDB.secondReceipts.length === 0 : accountingDB.firstReceipts.length === 0);
            setIsFirstPersonMode(!isFirstPersonMode)
          }}>{isFirstPersonMode ? accountingDB.secondName + ' ⏭️' : '⏮️ ' + accountingDB.firstName}</button>
          <button onClick={() => {
            if (isFirstPersonMode ? accountingDB.secondReceipts.length === 0 : accountingDB.firstReceipts.length === 0) {
              setShouldLoadReceipts(isFirstPersonMode ? accountingDB.secondReceipts.length === 0 : accountingDB.firstReceipts.length === 0);
              setIsFirstPersonMode(!isFirstPersonMode)
              const waitForOtherReceiptsToLoad = () => {
                if (isLoadingReceipts) {
                  setTimeout(waitForOtherReceiptsToLoad, 300);
                } else {
                  props.setResultReady(true)
                }
              };

              setTimeout(waitForOtherReceiptsToLoad, 300);
            } else {
              props.setResultReady(true)
            }
          }}>Result 🔬</button>
        </div>
      </div>
      {isInEditMode && !isLoading && !isLoadingReceipts && !shouldLoadReceipts &&
        <AddReceipt addReceipt={async (receipt: IReceipt) => {
          if (
            billDB.currentBill === undefined ||
            yearDBContext.currentYear === undefined ||
            monthDBContext.currentMonth === undefined
          ) { return; }

          const outDatedReceipts = accountingDB.firstReceipts;
          const updatedReceipts = accountingDB.firstReceipts;
          updatedReceipts.push(receipt);

          accountingDB.saveReceipts([...updatedReceipts], isFirstPersonMode);

          await accountingDB.addReceipt(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, billDB.currentBill.name, receipt).then(isSuccessful => {
            if (!isSuccessful) {
              accountingDB.saveReceipts([...outDatedReceipts], isFirstPersonMode);
            }
          });

          const updatedBill = billDB.currentBill;
          updatedBill.needsRefresh = true;
          await billDB.updateBill(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, updatedBill);


          document.getElementById('add-point')?.scrollIntoView();
        }} />
      }
      {isLoading || isLoadingReceipts || shouldLoadReceipts
        ? <div className={[styles.uploadSectionLoadingContent].join(' ')}>
          <progress value={progress} max={100}></progress>
        </div>
        : <div className={[styles.uploadSectionContent].join(' ')}>
          {/* TODO: find a better solution for the edit mode switching */}
          {accountingDB.firstReceipts.length !== 0 && isFirstPersonMode && !isInEditMode &&
            accountingDB.firstReceipts.map(receipt => {
              return (<Receipt
                key={receipt.receiptId}
                receipt={receipt}
                isInEditMode={false}
                deleteReceipt={async (receipt: IReceipt) => {
                  if (billDB.currentBill === undefined ||
                    yearDBContext.currentYear === undefined ||
                    monthDBContext.currentMonth === undefined) { return; }

                  const outDatedReceipts = accountingDB.firstReceipts;
                  const updatedReceipts = accountingDB.firstReceipts.filter(firstReceipt => firstReceipt.receiptId !== receipt.receiptId);

                  accountingDB.saveReceipts([...updatedReceipts], true);

                  await accountingDB.deleteReceipt(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, billDB.currentBill.name, receipt.receiptId).then(isSuccessful => {
                    if (!isSuccessful) {
                      accountingDB.saveReceipts([...outDatedReceipts], true);
                    }
                  });

                  const updatedBill = billDB.currentBill;
                  updatedBill.needsRefresh = true;
                  await billDB.updateBill(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, updatedBill);
                }} />);
            })
          }
          {accountingDB.secondReceipts.length !== 0 && !isFirstPersonMode && !isInEditMode &&
            accountingDB.secondReceipts.map(receipt => {
              return (<Receipt
                key={receipt.receiptId}
                receipt={receipt}
                isInEditMode={false}
                deleteReceipt={async (receipt: IReceipt) => {
                  if (billDB.currentBill === undefined ||
                    yearDBContext.currentYear === undefined ||
                    monthDBContext.currentMonth === undefined) { return; }
                  const outDatedReceipts = accountingDB.secondReceipts;
                  const updatedReceipts = accountingDB.secondReceipts.filter(secondReceipt => secondReceipt.receiptId !== receipt.receiptId);
                  accountingDB.saveReceipts([...updatedReceipts], false);

                  await accountingDB.deleteReceipt(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, billDB.currentBill.name, receipt.receiptId).then(isSuccessful => {
                    if (!isSuccessful) {
                      accountingDB.saveReceipts([...outDatedReceipts], false);
                    }
                  });
                  const updatedBill = billDB.currentBill;
                  updatedBill.needsRefresh = true;
                  await billDB.updateBill(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, updatedBill);
                }}
              />);
            })
          }
          {accountingDB.firstReceipts.length !== 0 && isFirstPersonMode && isInEditMode &&
            accountingDB.firstReceipts.map(receipt => {
              return (<Receipt
                key={receipt.receiptId}
                receipt={receipt}
                isInEditMode={true}
                deleteReceipt={async (receipt: IReceipt) => {
                  if (billDB.currentBill === undefined ||
                    yearDBContext.currentYear === undefined ||
                    monthDBContext.currentMonth === undefined) { return; }

                  const outDatedReceipts = accountingDB.firstReceipts;
                  const updatedReceipts = accountingDB.firstReceipts.filter(firstReceipt => firstReceipt.receiptId !== receipt.receiptId);

                  accountingDB.saveReceipts([...updatedReceipts], true);

                  await accountingDB.deleteReceipt(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, billDB.currentBill.name, receipt.receiptId).then(isSuccessful => {
                    if (!isSuccessful) {
                      accountingDB.saveReceipts([...outDatedReceipts], true);
                    }
                  });
                  const updatedBill = billDB.currentBill;
                  updatedBill.needsRefresh = true;
                  await billDB.updateBill(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, updatedBill);
                }} />);
            })
          }
          {accountingDB.secondReceipts.length !== 0 && !isFirstPersonMode && isInEditMode &&
            accountingDB.secondReceipts.map(receipt => {
              return (<Receipt
                key={receipt.receiptId}
                receipt={receipt}
                isInEditMode={true}
                deleteReceipt={async (receipt: IReceipt) => {
                  if (billDB.currentBill === undefined ||
                    yearDBContext.currentYear === undefined ||
                    monthDBContext.currentMonth === undefined) { return; }
                  const outDatedReceipts = accountingDB.secondReceipts;
                  const updatedReceipts = accountingDB.secondReceipts.filter(secondReceipt => secondReceipt.receiptId !== receipt.receiptId);
                  accountingDB.saveReceipts([...updatedReceipts], false);

                  await accountingDB.deleteReceipt(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, billDB.currentBill.name, receipt.receiptId).then(isSuccessful => {
                    if (!isSuccessful) {
                      accountingDB.saveReceipts([...outDatedReceipts], false);
                    }
                  });
                  const updatedBill = billDB.currentBill;
                  updatedBill.needsRefresh = true;
                  await billDB.updateBill(auth.user, userDB.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, updatedBill);
                }}
              />);
            })
          }
          <div id={'add-point'} />
        </div>
      }
      <input type='file' id={isFirstPersonMode ? 'firstUpload' : 'secondUpload'} accept='.csv' multiple={true} onChange={handleFileUpload} style={{ display: 'none' }} />
    </Card>
  );
}
