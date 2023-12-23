/** @format */
import Card from '@/components/Card';
import { IAccountingDataBaseContext, useAccountingDB } from '@/context/AccountingDatabaseContext';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import styles from '@/styles/components/receipt-manager/manager/UploadSection.module.css';
import { ChangeEvent, useEffect, useState } from 'react';

import * as DataParser from '@/handlers/DataParser';
import Receipt from './Receipt/Receipt';
import { IReceipt } from '@/interfaces/data/IReceipt';
import AddReceipt from './Receipt/AddReceipt';

interface IUploadSectionProps {
  className?: string
  setResultReady: (state: boolean) => void;
}

export default function UploadSection(props: React.PropsWithChildren<IUploadSectionProps>) {
  const accountingDB: IAccountingDataBaseContext = useAccountingDB();
  const billDB: IBillDataBaseContext = useBillDB();
  const userDB: IUserDataBaseContext = useUserDB();
  const auth: IAuthContext = useAuth();
  const [isInEditMode, setEditMode] = useState(false);
  const [isFirstPersonMode, setIsFirstPersonMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    setProgress(0);
    setIsLoading(true);
    const files = e.target.files;
    if (files === null || auth.user === null || billDB.currentBill === undefined) { return };
    const user = auth.user;
    const token = userDB.selectedConnection;
    const date = billDB.currentBill.name;
    const ownerUid = isFirstPersonMode ? accountingDB.firstUid : accountingDB.secondUid;
    const shareUid = !isFirstPersonMode ? accountingDB.firstUid : accountingDB.secondUid;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const receipts = await DataParser.parseFileToReceipts(file, ownerUid, shareUid);
      for (let j = 0; j < receipts.length; j++) {
        const receipt = receipts[j];
        await accountingDB.addReceipt(user, token, date, receipt);
        setProgress(((index + 1 + j + 1) / (files.length + receipts.length)) * 100);
      }
      const oldReceipts = isFirstPersonMode ? accountingDB.firstReceipts : accountingDB.secondReceipts;
      accountingDB.saveReceipts(oldReceipts.concat(receipts), isFirstPersonMode);
    }

    e.target.value = '';
    setIsLoading(false);
    setProgress(0);
  }

  return <div className={[].join(' ')}>
    <Card className={[styles.uploadSection].join(' ')}>
      <div className={[styles.uploadSectionHeader].join(' ')}>
        <div className={[styles.uploadSectionHeaderTitleWrapper].join(' ')}>
          <h2 onChange={(e) => {
            //TODO: make bill date editable
            // contentEditable={isInEditMode}
            // const currentBill = billDB.currentBill;
            // if (currentBill === undefined) { return; }
          }}>{billDB.currentBill?.date.format('DD.MM.YYYY')}</h2>
          <h2> | {isFirstPersonMode ? accountingDB.firstName : accountingDB.secondName}&apos;s Receipts</h2>
        </div>

        <div className={[styles.uploadSectionHeaderControls].join(' ')}>
          <div className={[styles.uploadSectionHeaderModeWrapper].join(' ')}>
            <button disabled={isInEditMode} onClick={() => {
              setEditMode(true);
            }}>Edit Mode</button>
            <button disabled={!isInEditMode} onClick={() => {
              setEditMode(false);
            }}>Accounting</button>
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
              if (billDB.currentBill === undefined) {
                return;
              }
              setIsLoading(true);
              setProgress(0);
              const user = auth.user;
              const token = userDB.selectedConnection;
              const date = billDB.currentBill.name;
              const outDatedReceipts = isFirstPersonMode ? accountingDB.firstReceipts : accountingDB.secondReceipts;
              const receipts = isFirstPersonMode ? accountingDB.firstReceipts : accountingDB.secondReceipts;
              accountingDB.saveReceipts([], isFirstPersonMode);

              let isSuccessful = true;

              for (let index = 0; index < receipts.length; index++) {
                const receipt = receipts[index];
                isSuccessful = await accountingDB.deleteReceipt(user, token, date, receipt.receiptId);
                setProgress(((index + 1) / receipts.length) * 100);
                if (!isSuccessful) {
                  accountingDB.saveReceipts([...outDatedReceipts], isFirstPersonMode);
                  // TODO: Implement a better receipt savemode
                }
              }

              setIsLoading(false);
              setProgress(0);
            }}
          >Clear data</button>
          <hr />
          <button onClick={() => { setIsFirstPersonMode(!isFirstPersonMode) }}>{isFirstPersonMode ? 'Next person' : 'Prev. person'}</button>
          <button onClick={() => { props.setResultReady(true) }}>Result</button>
        </div>
      </div>
      {isInEditMode && !isLoading &&
        <AddReceipt addReceipt={async (receipt: IReceipt) => {
          if (billDB.currentBill === undefined) { return; }

          const outDatedReceipts = accountingDB.firstReceipts;
          const updatedReceipts = accountingDB.firstReceipts;
          updatedReceipts.push(receipt);

          accountingDB.saveReceipts([...updatedReceipts], isFirstPersonMode);

          await accountingDB.addReceipt(auth.user, userDB.selectedConnection, billDB.currentBill.name, receipt).then(isSuccessful => {
            if (!isSuccessful) {
              accountingDB.saveReceipts([...outDatedReceipts], isFirstPersonMode);
            }
          });
          document.getElementById('add-point')?.scrollIntoView();
        }} />
      }
      {isLoading
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
                  if (billDB.currentBill === undefined) { return; }

                  const outDatedReceipts = accountingDB.firstReceipts;
                  const updatedReceipts = accountingDB.firstReceipts.filter(firstReceipt => firstReceipt.receiptId !== receipt.receiptId);

                  accountingDB.saveReceipts([...updatedReceipts], true);

                  await accountingDB.deleteReceipt(auth.user, userDB.selectedConnection, billDB.currentBill.name, receipt.receiptId).then(isSuccessful => {
                    if (!isSuccessful) {
                      accountingDB.saveReceipts([...outDatedReceipts], true);
                    }
                  });
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
                  if (billDB.currentBill === undefined) { return; }
                  const outDatedReceipts = accountingDB.secondReceipts;
                  const updatedReceipts = accountingDB.secondReceipts.filter(secondReceipt => secondReceipt.receiptId !== receipt.receiptId);
                  accountingDB.saveReceipts([...updatedReceipts], false);

                  await accountingDB.deleteReceipt(auth.user, userDB.selectedConnection, billDB.currentBill.name, receipt.receiptId).then(isSuccessful => {
                    if (!isSuccessful) {
                      accountingDB.saveReceipts([...outDatedReceipts], false);
                    }
                  });
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
                  if (billDB.currentBill === undefined) { return; }

                  const outDatedReceipts = accountingDB.firstReceipts;
                  const updatedReceipts = accountingDB.firstReceipts.filter(firstReceipt => firstReceipt.receiptId !== receipt.receiptId);

                  accountingDB.saveReceipts([...updatedReceipts], true);

                  await accountingDB.deleteReceipt(auth.user, userDB.selectedConnection, billDB.currentBill.name, receipt.receiptId).then(isSuccessful => {
                    if (!isSuccessful) {
                      accountingDB.saveReceipts([...outDatedReceipts], true);
                    }
                  });
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
                  if (billDB.currentBill === undefined) { return; }
                  const outDatedReceipts = accountingDB.secondReceipts;
                  const updatedReceipts = accountingDB.secondReceipts.filter(secondReceipt => secondReceipt.receiptId !== receipt.receiptId);
                  accountingDB.saveReceipts([...updatedReceipts], false);

                  await accountingDB.deleteReceipt(auth.user, userDB.selectedConnection, billDB.currentBill.name, receipt.receiptId).then(isSuccessful => {
                    if (!isSuccessful) {
                      accountingDB.saveReceipts([...outDatedReceipts], false);
                    }
                  });
                }}
              />);
            })
          }
          <div id={'add-point'} />
        </div>
      }
    </Card>
    <input type='file' id={isFirstPersonMode ? 'firstUpload' : 'secondUpload'} accept='.csv' multiple={true} onChange={handleFileUpload} style={{ display: 'none' }} />
  </div>;
}
