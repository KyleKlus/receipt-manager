/** @format */
import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/Content';
import { ExportToCsv } from 'export-to-csv';

import Main from '@/components/Main';

import styles from '@/styles/ReceiptManager.module.css'
import headerStyles from '@/styles/components/header/Header.module.css'
import sideNavStyles from '@/styles/components/header/SideNavigation.module.css'
import footerStyles from '@/styles/components/footer/Footer.module.css'

import ScrollNavLink from '@/components/header/ScrollNavLink';
import dynamic from 'next/dynamic';

import Link from 'next/link';
import NavLink from '@/components/header/NavLink';
import Card from '@/components/Card';
import { ChangeEvent, SyntheticEvent, useState } from 'react';
import useStorage from '@/hooks/useStorage';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});



export interface IListItem {
  name: string;
  price: number;
  amount: number;
  category: Category;
  shared: boolean;
  rejected: boolean;
}

export enum Category {
  Food,
  Household,
  Cleaning,
  Cosmetics,
  Hardware,
  Pet,
  Travel,
  Dates,
  Misc
}

const DEFAULT_CATEGORY: Category = Category.Food;

export default function Home() {
  const { getItem, removeItem, setItem } = useStorage();
  const [firstPersonName, setFirstPersonName] = useState<string>('Person 1');
  const [secondPersonName, setSecondPersonName] = useState<string>('Person 2');



  let firstStoredListString = null;
  let firstStoredList: IListItem[] = [];

  let secondStoredListString = null;
  let secondStoredList: IListItem[] = [];

  // firstStoredListString = getItem('firstList', 'session');
  // if (firstStoredListString !== null && firstStoredListString !== undefined && firstStoredListString !== '' && firstStoredListString !== 'undefined') {
  //   console.log(firstStoredListString);
  //   firstStoredList = JSON.parse(firstStoredListString) as IListItem[];

  // }

  // secondStoredListString = getItem('secondList', 'session');
  // if (secondStoredListString !== null && secondStoredListString !== undefined && secondStoredListString !== '' && secondStoredListString !== 'undefined') {

  //   secondStoredList = JSON.parse(secondStoredListString) as IListItem[];
  // }

  const [firstList, setFirstList] = useState<IListItem[]>(firstStoredListString === null ? [] : firstStoredList);
  const [firstItemName, setFirstItemName] = useState<string>('');
  const [firstItemPrice, setFirstItemPrice] = useState<number>(NaN);
  const [firstItemAmount, setFirstItemAmount] = useState<number>(NaN);

  const [secondList, setSecondList] = useState<IListItem[]>(secondStoredListString === null ? [] : secondStoredList);
  const [secondItemName, setSecondItemName] = useState<string>('');
  const [secondItemPrice, setSecondItemPrice] = useState<number>(NaN);
  const [secondItemAmount, setSecondItemAmount] = useState<number>(NaN);

  function selectCategory(index: number, isFirstList: boolean, e: SyntheticEvent<HTMLSelectElement, Event>) {
    const updatedList: IListItem[] = isFirstList ? firstList : secondList;

    const categoryName: string = e.currentTarget.value;
    const categoryIndex: number = (Object.keys(Category) as Array<keyof typeof Category>).slice((Object.keys(Category).length / 2)).map((key) => { return key.toString() }).indexOf(categoryName);
    const selectedCategory: Category = categoryIndex
    updatedList[index].category = selectedCategory;

    isFirstList ? setFirstList([...updatedList]) : setSecondList([...updatedList]);
  }

  function toggleRejectItem(index: number, isFirstList: boolean) {
    const updatedList: IListItem[] = isFirstList ? firstList : secondList;

    if (updatedList[index].shared === true && !updatedList[index].rejected === true) { updatedList[index].shared = false };
    updatedList[index].rejected = !updatedList[index].rejected;

    isFirstList ? setFirstList([...updatedList]) : setSecondList([...updatedList]);
  }

  function toggleShareItem(index: number, isFirstList: boolean) {
    const updatedList: IListItem[] = isFirstList ? firstList : secondList;

    if (updatedList[index].rejected === true && !updatedList[index].shared === true) { updatedList[index].rejected = false };
    updatedList[index].shared = !updatedList[index].shared;

    isFirstList ? setFirstList([...updatedList]) : setSecondList([...updatedList]);
  }

  function toggleMyItem(index: number, isFirstList: boolean) {
    const updatedList: IListItem[] = isFirstList ? firstList : secondList;

    updatedList[index].shared = !updatedList[index].shared && !updatedList[index].rejected;
    updatedList[index].rejected = false;

    isFirstList ? setFirstList([...updatedList]) : setSecondList([...updatedList]);
  }

  function listToMatrix(list: string[], elementsPerSubArray: number) {
    const matrix: string[][] = [];
    let k = -1;

    for (let i = 0; i < list.length; i++) {
      if (i % elementsPerSubArray === 0) {
        k++;
        matrix[k] = [];
      }

      matrix[k].push(list[i]);
    }

    return matrix;
  }

  function firstCharToUppercase(text: string): string {
    if (text !== undefined && text !== '' && text.length > 1) {
      // Make first letter of text uppercase
      const firstLetterOfText: string = text[0].toUpperCase();
      const restOfText: string = text.slice(1);
      return firstLetterOfText + restOfText;
    }
    return '';
  }

  function parseFileToIListItems(file: File): Promise<IListItem[]> {
    let items: IListItem[] = []

    let reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      reader.onload = () => {
        const result = reader.result;

        if (result !== null && result !== undefined) {
          const receiptsHeader: string[] = result.toString().split('\n')[0].split(',');
          const receiptHeaderCount: number = receiptsHeader.length;
          const itemHeader: string[] = receiptsHeader.reverse()[0].split('|');
          const itemHeaderCount: number = itemHeader.length;
          const receipts: string[] = result.toString().split('\n').slice(1).filter((item) => { return item.length > 1 });

          for (let i: number = 0; i < receipts.length; i++) {
            const receipt: string[] = receipts[i].split(',');
            const receiptItems: string[][] = listToMatrix(receipt.slice(receiptHeaderCount).join('').replaceAll('"', '').split('|'), itemHeaderCount).filter((item) => { return item.length > 1 });

            let parsedReceipt = receiptItems.map(list => {
              let itemName = firstCharToUppercase(list[0]);
              itemName = itemName !== '' ? itemName : 'Unrecognized Item';
              const itemAmount: number = list[5] === '' ? 1 : Math.floor(parseFloat(list[5]) * 100) / 100;

              return {
                name: itemName,
                price: Math.floor(parseFloat(list[2]) * -100) / 100,
                amount: itemAmount,
                shared: true,
                rejected: false,
                category: DEFAULT_CATEGORY
              }
            })

            // Add store name to receipt
            parsedReceipt = parsedReceipt.reverse();
            let storeName = firstCharToUppercase(receipt[3]);
            storeName = storeName !== '' ? storeName : 'Unrecognized Store';

            parsedReceipt.push({
              name: storeName,
              price: Math.floor(parseFloat(receipt[8]) * -100) / 100,
              amount: 0,
              shared: false,
              rejected: false,
              category: DEFAULT_CATEGORY
            })
            parsedReceipt = parsedReceipt.reverse()

            items = items.concat(parsedReceipt)
          }
        }

        resolve(items);
      };

      reader.readAsText(file);
    });
  }

  async function uploadFile(e: ChangeEvent<HTMLInputElement>, isFirstList: boolean) {
    const files = e.target.files;

    if (files !== null && files !== undefined) {
      let items: IListItem[] = [];

      for (let i = 0; i < files.length; i++) {
        items = items.concat(await parseFileToIListItems(files[i]));
      }

      if (isFirstList) {
        setFirstList([...items])
        // removeItem('firstList'), 'session'
        // setItem('firstList', JSON.stringify([...items]), 'session')


      } else {
        setSecondList([...items])
        // removeItem('secondList', 'session')
        // setItem('secondList', JSON.stringify([...items]), 'session')

      }
    }
    e.target.value = '';
  }

  function handleFirstFileUpload(e: ChangeEvent<HTMLInputElement>) { uploadFile(e, true); }

  function handleSecondFileUpload(e: ChangeEvent<HTMLInputElement>) { uploadFile(e, false); }

  function downloadCSV(name: string, data: string[]) {
    if (name === undefined || data === undefined || name === '' || data.length === 0 || data[0] === '') { return; }
    const link = document.createElement('a');
    const fileBlob = new Blob(data, { type: 'text/csv' });
    link.href = URL.createObjectURL(fileBlob);
    link.download = name + '.csv';
    document.body.appendChild(link);
    link.click();
  }

  function prepCSVdData(myList: IListItem[], otherList: IListItem[]): string {
    let dataString: string = '';

    if (myList === undefined || otherList === undefined) { return dataString; }
    if (myList.length === 0 && otherList.length === 0) { return dataString; }

    let filteredList: IListItem[] = myList.slice(0);
    let otherFilteredList: IListItem[] = otherList.slice(0);

    filteredList = filteredList.filter(e => e.amount !== 0 && !e.rejected).slice(0);
    filteredList = filteredList.map((item) => {
      if (item.shared) {
        item.price = item.price / 2;
      }
      return item;
    }).slice(0);

    otherFilteredList = otherFilteredList.filter(e => e.amount !== 0 && (e.rejected || e.shared)).slice(0);
    otherFilteredList = otherFilteredList.map((item) => {
      if (item.shared) {
        item.price = item.price / 2;
      }

      return item;
    }).slice(0);

    const data = filteredList.concat(otherFilteredList).slice(0).map((e) => {
      return {
        name: e.name,
        price: e.price,
        amount: e.amount,
        category: Category[e.category],
        shared: e.shared,
        rejected: e.rejected,
      }
    }).slice(0);

    if (data.length === 0) { return dataString; }

    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      title: 'expenses',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };
    const csvExporter = new ExportToCsv(options);
    dataString = csvExporter.generateCsv(data, true);

    return dataString;
  }

  // const handleFirstPersonDownload = () => {
  //   const rawData = firstList.filter((item) => { return !item.rejected });
  //   let dataString: string;
  //   downloadCSV(firstPersonName + '_expenses', dataString);
  // };

  // const handleSecondPersonDownload = () => {
  //   const data = secondList;
  //   downloadCSV(secondPersonName + '_expenses', data);
  // };

  function calcTotal(list: IListItem[]): number {
    let myTotal: number = 0;

    const myList: IListItem[] = list;

    let myItems: IListItem[] = myList.filter(item => { return !item.rejected && !item.shared });

    myItems.forEach(item => {
      myTotal += item.price
    });

    return Math.floor((myTotal) * 100) / 100;
  }

  function calcShared(list: IListItem[]): number {
    let myShared: number = 0;

    const myList: IListItem[] = list;

    let myItems: IListItem[] = myList.filter(item => { return item.shared });

    myItems.forEach(item => {
      myShared += item.price
    });

    return Math.floor((myShared) * 100) / 100;
  }

  function calcRejected(list: IListItem[]): number {
    let myRejected: number = 0;

    const myList: IListItem[] = list;

    let myItems: IListItem[] = myList.filter(item => { return item.rejected });

    myItems.forEach(item => {
      myRejected += item.price
    });

    return Math.floor((myRejected) * 100) / 100;
  }

  function calcResult(list: IListItem[], isFirstResult: boolean): number {
    let myResult: number = 0;
    let otherResult: number = 0;

    let myRejectedResult: number = 0;
    let otherRejectedResult: number = 0;

    let mySharedResult: number = 0;
    let otherSharedResult: number = 0;

    const myList: IListItem[] = isFirstResult ? firstList : secondList;
    const otherList: IListItem[] = isFirstResult ? secondList : firstList;

    let mySharedItems: IListItem[] = myList.filter(item => { return item.shared });
    let otherSharedItems: IListItem[] = otherList.filter(item => { return item.shared });

    let myItems: IListItem[] = myList.filter(item => { return !item.rejected && !item.shared });
    let myRejectedItems = myList.filter(item => { return item.rejected });

    let otherItems: IListItem[] = otherList.filter(item => { return !item.rejected && !item.shared });
    let otherRejectedItems = otherList.filter(item => { return item.rejected });

    myItems.forEach(item => {
      myResult += item.price
    });

    otherItems.forEach(item => {
      otherResult += item.price
    });

    myRejectedItems.forEach(item => {
      myRejectedResult += item.price
    });

    otherRejectedItems.forEach(item => {
      otherRejectedResult += item.price
    });

    mySharedItems.forEach(item => {
      mySharedResult += Math.floor((item.price / 2) * 100) / 100
    });

    otherSharedItems.forEach(item => {
      otherSharedResult += Math.floor((item.price / 2) * 100) / 100
    });

    const myFinalResult = otherSharedResult + otherRejectedResult
    const otherFinalResult = mySharedResult + myRejectedResult

    return myFinalResult > otherFinalResult ? Math.floor((myFinalResult - otherFinalResult) * 100) / 100 : 0
  }

  function getSideNavChildren() {
    return (
      <Card className={sideNavStyles.menuCard}>
        <h4>Other Sites</h4>
        <NavLink
          className={sideNavStyles.sideNavLink}
          pathName="/projects"
          displayText="Projects"
        />
        <NavLink
          className={sideNavStyles.sideNavLink}
          pathName="/Kyles-Cookbook/en"
          displayText="Cookbook 🇬🇧"
        />
        <NavLink
          className={sideNavStyles.sideNavLink}
          pathName="/Kyles-Cookbook/de"
          displayText="Cookbook 🇩🇪"
        />
      </Card>
    );
  }

  function generateTableHeader(): JSX.Element {
    return (
      <tr>
        <th>Name</th>
        <th>€</th>
        <th>Amt.</th>
        <th >{firstPersonName[0] === secondPersonName[0] ? firstPersonName[0] + ' 1' : firstPersonName[0]}</th>
        <th>Sh.</th>
        <th >{firstPersonName[0] === secondPersonName[0] ? secondPersonName[0] + ' 2' : secondPersonName[0]}</th>
        <th >Categ.</th>
      </tr>
    );
  }

  function generateTableRows(list: IListItem[], isFirstList: boolean): JSX.Element[] {
    const rows: JSX.Element[] = [];

    for (let i = 0; i < list.length; i++) {
      const item: IListItem = list[i];

      const isHeader = item.amount === 0;
      const isShared = isHeader ? false : item.shared
      const isRejected = isHeader ? false : item.rejected
      const isMine = isHeader ? false : !item.shared && !item.rejected

      const cellHeaderClass = isHeader ? styles.personTableCellHeader : ''

      rows.push(
        <tr key={i}>
          <td className={[cellHeaderClass].join(' ')}><div>{item.name}</div></td>
          <td className={[cellHeaderClass].join(' ')}>{item.price + ' €'}</td>
          <td className={[cellHeaderClass].join(' ')}>{isHeader ? '' : item.amount}</td>
          {isFirstList &&
            <td className={[cellHeaderClass].join(' ')}>{!isHeader && <input disabled={isHeader} checked={isMine} type='radio' onChange={() => { toggleMyItem(i, isFirstList) }}></input>}</td>}
          {!isFirstList && <td className={[cellHeaderClass].join(' ')}>{!isHeader && <input disabled={isHeader} checked={isRejected} type='radio' onChange={() => { toggleRejectItem(i, isFirstList) }}></input>}</td>}
          <td className={[cellHeaderClass].join(' ')}>{!isHeader && <input disabled={isHeader} checked={isShared} type='radio' onChange={() => { toggleShareItem(i, isFirstList) }}></input>}</td>
          {!isFirstList &&
            <td className={[cellHeaderClass].join(' ')}>{!isHeader && <input disabled={isHeader} checked={isMine} type='radio' onChange={() => { toggleMyItem(i, isFirstList) }}></input>}</td>}
          {isFirstList &&
            <td className={[cellHeaderClass].join(' ')}>{!isHeader && <input disabled={isHeader} checked={isRejected} type='radio' onChange={() => { toggleRejectItem(i, isFirstList) }}></input>}</td>}
          <td className={[cellHeaderClass].join(' ')}>{!isHeader && <select disabled={isHeader} defaultValue={Category[item.category]} onChange={(e) => {
            selectCategory(i, isFirstList, e)
          }}>
            {(Object.keys(Category) as Array<keyof typeof Category>).slice((Object.keys(Category).length / 2)).map((key, n) => { return (<option key={n} value={key}>{key}</option>) })}
          </select>}</td>
        </tr>
      )
    }

    return rows;
  }

  return (
    <>
      <Head>
        <title>Kyle Klus | Receipt Manager</title>
        <meta
          name="description"
          content="Receipt Manager"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link rel="manifest" href={process.env.basePath + "/manifest.webmanifest"}></link>
        <link rel="manifest" href={process.env.basePath + "/manifest.json"}></link>
        <link
          rel="shortcut icon"
          href={process.env.basePath + "/favicon.ico"}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={process.env.basePath + "/apple-touch-icon.png"}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={process.env.basePath + "/favicon-32x32.png"}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={process.env.basePath + "/favicon-16x16.png"}
        />
      </Head>
      <Header sideNavChildren={getSideNavChildren()}>
        <ScrollNavLink
          className={headerStyles.headerNavLink}
          elementName="https://majorenkidu.github.io/#heroPage"
          displayText="Home"
        />
        <ScrollNavLink
          className={headerStyles.headerNavLink}
          elementName="https://majorenkidu.github.io/#portfolioPage"
          displayText="Portfolio"
        />
        <ScrollNavLink
          className={headerStyles.headerNavLink}
          elementName="https://majorenkidu.github.io/#aboutPage"
          displayText="About"
        />
        <ThemeButton />
      </Header>
      <Main>
        <div id={'top'}></div>
        <Content className={['applyHeaderOffset'].join(' ')}>
          <div className={['applyHeaderOffset', styles.split].join(' ')}>
            <div className={[styles.personCell].join(' ')}>
              <div className={[styles.personHeader].join(' ')}>
                <input className={[styles.personName].join(' ')} type={'text'} value={firstPersonName} placeholder={'1. Person Name'} onChange={(e) => {
                  setFirstPersonName(e.currentTarget.value);
                }} />
                <div>
                  <button className={[styles.fancyButton].join('')} onClick={() => {
                    setFirstList([]);
                    // removeItem('firstList', 'session')

                  }}>Clear Data</button>
                  <button className={[styles.fancyButton].join('')} onClick={() => {
                    if (typeof window !== null && typeof window !== undefined) {
                      window.document.getElementById('firstUpload')!.click()
                    }
                  }}>Upload Data</button>
                  <button disabled={secondList.length === 0 && firstList.length === 0} className={[styles.fancyButton].join('')} onClick={() => {
                    downloadCSV(firstPersonName + '_expenses', [prepCSVdData(firstList, secondList)])
                  }}>Export Expenses</button>
                </div>

                <input type='file' id='firstUpload' accept='.csv' multiple={true} onChange={handleFirstFileUpload} style={{ display: 'none' }}></input>
              </div>
              <hr />
              <div className={[styles.personTableSum].join(' ')}>
                <div>Total shared: </div>
                <div>{calcShared(firstList)} €</div>
              </div>
              <div className={[styles.personTableSum].join(' ')}>
                <div>Total rejected: </div>
                <div>{calcRejected(firstList)} €</div>
              </div>
              <div className={[styles.personTableSum].join(' ')}>
                <div>{firstPersonName} personal Stuff: </div>
                <div>{calcTotal(firstList)} €</div>
              </div>
              <hr />
              <div className={[styles.personTableSum].join(' ')}>
                <div>Result: </div>
                <div>{calcResult(firstList, true)} €</div>
              </div>

              <div className={[styles.personAddItemWrapper].join(' ')}>
                <input placeholder='Name' type='text' value={firstItemName} onChange={(e) => { setFirstItemName(e.target.value) }}></input>
                <input placeholder='Price' type='number' value={Number.isNaN(firstItemPrice) ? '' : firstItemPrice} onChange={(e) => { setFirstItemPrice(e.target.valueAsNumber) }}></input>
                <input placeholder='Amount' type='number' value={Number.isNaN(firstItemAmount) ? '' : firstItemAmount} step="1" min="1" onChange={(e) => { setFirstItemAmount(e.target.valueAsNumber) }}></input>
                <button className={[styles.fancyButton].join('')} onClick={() => {
                  if (firstItemName === '' || firstItemPrice === 0 || firstItemAmount < 0.01 || !Number.isInteger(firstItemAmount)) { return }
                  const tmpList = firstList;
                  tmpList.push({
                    name: firstItemName,
                    price: firstItemPrice,
                    amount: firstItemAmount,
                    shared: true,
                    rejected: false,
                    category: DEFAULT_CATEGORY
                  })
                  setFirstList([...tmpList])
                  setFirstItemName('')
                  setFirstItemPrice(NaN)
                  setFirstItemAmount(NaN)
                }}>+ Add</button>
              </div>

              {firstList.length !== 0 &&
                <table className={[styles.personTable].join(' ')}>
                  <thead>{generateTableHeader()}</thead>
                  <tbody>
                    {
                      ...generateTableRows(firstList, true)
                    }</tbody>
                </table>
              }
            </div>
            <div className={[styles.personCell].join(' ')}>
              <div className={[styles.personHeader].join(' ')}>
                <input className={[styles.personName].join(' ')} type={'text'} value={secondPersonName} placeholder={'2. Person Name'} onChange={(e) => {
                  setSecondPersonName(e.currentTarget.value);
                }} />
                <div>
                  <button className={[styles.fancyButton].join('')} onClick={() => {
                    setSecondList([]);
                    // removeItem('secondList', 'session')
                  }}>Clear Data</button>
                  <button className={[styles.fancyButton].join('')} onClick={() => {
                    if (typeof window !== null && typeof window !== undefined) {
                      window.document.getElementById('secondUpload')!.click()
                    }
                  }}>Upload Data</button>
                  <button disabled={secondList.length === 0 && firstList.length === 0} className={[styles.fancyButton].join('')} onClick={() => {
                    downloadCSV(secondPersonName + '_expenses', [prepCSVdData(secondList, firstList)])
                  }}>Export Expenses</button>
                </div>

                <input type='file' id='secondUpload' accept='.csv' multiple={true} onChange={handleSecondFileUpload} style={{ display: 'none' }}></input>
              </div>
              <hr />
              <div className={[styles.personTableSum].join(' ')}>
                <div>Total shared: </div>
                <div>{calcShared(secondList)} €</div>
              </div>
              <div className={[styles.personTableSum].join(' ')}>
                <div>Total rejected: </div>
                <div>{calcRejected(secondList)} €</div>
              </div>
              <div className={[styles.personTableSum].join(' ')}>
                <div>{secondPersonName} personal stuff: </div>
                <div>{calcTotal(secondList)} €</div>
              </div>
              <hr />
              <div className={[styles.personTableSum].join(' ')}>
                <div>Result: </div>
                <div>{calcResult(secondList, false)} €</div>
              </div>

              <div className={[styles.personAddItemWrapper].join(' ')}>
                <input placeholder='Name' type='text' value={secondItemName} onChange={(e) => { setSecondItemName(e.target.value) }}></input>
                <input placeholder='Price' type='number' value={Number.isNaN(secondItemPrice) ? '' : secondItemPrice} onChange={(e) => { setSecondItemPrice(e.target.valueAsNumber) }}></input>
                <input placeholder='Amount' type='number' value={Number.isNaN(secondItemAmount) ? '' : secondItemAmount} step="1" min="1" onChange={(e) => { setSecondItemAmount(e.target.valueAsNumber) }}></input>
                <button className={[styles.fancyButton].join('')} onClick={() => {
                  if (secondItemName === '' || secondItemPrice === 0 || secondItemAmount < 0.01 || !Number.isInteger(secondItemAmount)) { return }
                  const tmpList = secondList;
                  tmpList.push({
                    name: secondItemName,
                    price: secondItemPrice,
                    amount: secondItemAmount,
                    shared: true,
                    rejected: false,
                    category: DEFAULT_CATEGORY
                  })
                  setSecondList([...tmpList])
                  setSecondItemName('')
                  setSecondItemPrice(NaN)
                  setSecondItemAmount(NaN)
                }}>+ Add</button>
              </div>
              {secondList.length !== 0 &&
                <table className={[styles.personTable].join(' ')}>
                  <thead>{generateTableHeader()}</thead>
                  <tbody>
                    {...generateTableRows(secondList, false)}
                  </tbody>
                </table>
              }
            </div>
          </div>
        </Content>
        <Footer>
          <ScrollNavLink
            className={footerStyles.footerNavLink}
            elementName="https://majorenkidu.github.io/#heroPage"
            displayText="Home"
          />
          <ScrollNavLink
            className={footerStyles.footerNavLink}
            elementName="https://majorenkidu.github.io/#portfolioPage"
            displayText="Portfolio"
          />
          <ScrollNavLink
            className={footerStyles.footerNavLink}
            elementName="https://majorenkidu.github.io/#aboutPage"
            displayText="About"
          />
          <Link href={'https://github.com/MajorEnkidu'} className={footerStyles.footerNavLink}>GitHub</Link>
          <Link href={'https://www.linkedin.com/in/kyle-klus-9a2588275'} className={footerStyles.footerNavLink}>LinkedIn</Link>
          <Link href={'https://ko-fi.com/majorenkidu'} className={footerStyles.footerNavLink}>Ko-fi</Link>
          <Link href={'mailto:kyle.klus.2@gmail.com'} className={footerStyles.footerNavLink}>Contact</Link>
          <NavLink
            className={footerStyles.sideNavLink + ' ' + footerStyles.footerNavLink}
            pathName="https://majorenkidu.github.io/privacy"
            displayText="Privacy"
          />
        </Footer>
      </Main>
    </>
  );
}
