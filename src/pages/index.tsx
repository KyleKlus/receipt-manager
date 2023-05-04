/** @format */
import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/Content';
import Text from '@/components/Text';
import Image from 'next/image';

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
import { ChangeEvent, useState } from 'react';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});


interface IListItem {
  name: string;
  price: number;
  amount: number;
  shared: boolean;
  rejected: boolean;
}

export default function Home() {
  const [firstList, setFirstList] = useState<IListItem[]>([]);
  const [secondList, setSecondList] = useState<IListItem[]>([]);

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

            let parsedItems = receiptItems.map(list => {
              const amount: number = list[5] === '' ? 1 : Math.floor(parseFloat(list[5]) * 100) / 100
              let name = list[0].slice(1)
              name = list[0][0].toUpperCase() + name

              return {
                name: name,
                price: Math.floor(parseFloat(list[2]) * -100) / 100,
                amount: amount,
                shared: true,
                rejected: false
              }
            })

            parsedItems = parsedItems.reverse()
            let name = receipt[3].slice(1)
            name = receipt[3][0].toUpperCase() + name
            parsedItems.push({
              name: name,
              price: 0,
              amount: 0,
              shared: false,
              rejected: false
            })
            parsedItems = parsedItems.reverse()

            items = items.concat(parsedItems)
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

      isFirstList ? setFirstList([...items]) : setSecondList([...items]);
    }
  }

  function handleFirstFileUpload(e: ChangeEvent<HTMLInputElement>) { uploadFile(e, true); }

  function handleSecondFileUpload(e: ChangeEvent<HTMLInputElement>) { uploadFile(e, false); }

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
        <th>Price</th>
        <th>Amount</th>
        <th>P 1</th>
        <th>Share</th>
        <th>P 2</th>
      </tr>
    );
  }

  function generateTableRows(list: IListItem[], isFirstList: boolean): JSX.Element[] {
    const rows: JSX.Element[] = [];

    for (let i = 0; i < list.length; i++) {
      const item: IListItem = list[i];

      const isHeader = item.price === 0
      const isShared = isHeader ? false : item.shared
      const isRejected = isHeader ? false : item.rejected
      const isMine = isHeader ? false : !item.shared && !item.rejected

      const cellHeaderClass = isHeader ? styles.personTableCellHeader : ''

      rows.push(
        <tr key={i}>
          <td className={[cellHeaderClass].join(' ')}><div>{item.name}</div></td>
          <td className={[cellHeaderClass].join(' ')}>{isHeader ? '' : item.price + ' €'}</td>
          <td className={[cellHeaderClass].join(' ')}>{isHeader ? '' : item.amount}</td>
          <td className={[cellHeaderClass].join(' ')}><input disabled={isHeader} checked={isMine} type='radio' onChange={() => { toggleMyItem(i, isFirstList) }}></input></td>
          <td className={[cellHeaderClass].join(' ')}><input disabled={isHeader} checked={isShared} type='radio' onChange={() => { toggleShareItem(i, isFirstList) }}></input></td>
          <td className={[cellHeaderClass].join(' ')}><input disabled={isHeader} checked={isRejected} type='radio' onChange={() => { toggleRejectItem(i, isFirstList) }}></input></td>
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
                <h2>Person 1</h2>
                <button onClick={() => {
                  if (typeof window !== null && typeof window !== undefined) {
                    window.document.getElementById('firstUpload')!.click()
                  }
                }}>Upload CSV</button>
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
                <div>Person 1 personal Stuff: </div>
                <div>{calcTotal(firstList)} €</div>
              </div>
              <hr />
              <div className={[styles.personTableSum].join(' ')}>
                <div>Result: </div>
                <div>{calcResult(firstList, true)} €</div>
              </div>
              <table className={[styles.personTable].join(' ')}>
                <thead>{generateTableHeader()}</thead>
                <tbody>{...generateTableRows(firstList, true)}</tbody>
              </table>
            </div>
            <div className={[styles.personCell].join(' ')}>
              <div className={[styles.personHeader].join(' ')}>
                <h2>Person 2</h2>
                <button onClick={() => {
                  if (typeof window !== null && typeof window !== undefined) {
                    window.document.getElementById('secondUpload')!.click()
                  }
                }}>Upload CSV</button>
                <input type='file' id='secondUpload' accept='.csv' multiple={true} onChange={handleSecondFileUpload} style={{ display: 'none' }}></input>
              </div>
              <hr />
              <div className={[styles.personTableSum].join(' ')}>
                <div>Total shared: </div>
                <div>{calcShared(secondList)} €</div>
              </div>
              <div className={[styles.personTableSum].join(' ')}>
                <div>Total Person 2: </div>
                <div>{calcRejected(secondList)} €</div>
              </div>
              <div className={[styles.personTableSum].join(' ')}>
                <div>Total Person 1: </div>
                <div>{calcTotal(secondList)} €</div>
              </div>
              <hr />
              <div className={[styles.personTableSum].join(' ')}>
                <div>Result: </div>
                <div>{calcResult(secondList, false)} €</div>
              </div>
              <table className={[styles.personTable].join(' ')}>
                <thead>{generateTableHeader()}</thead>
                <tbody>{...generateTableRows(secondList, false)}</tbody>
              </table>
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
