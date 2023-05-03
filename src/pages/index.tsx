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
          const firstHeaderCount = result.toString().split('\n')[0].split(',').length;
          const secondHeaderCount = result.toString().split('\n')[0].split(',').reverse()[0].split('|').length

          const dataString = result.toString().split('\n')[1].split(',').slice(firstHeaderCount).join('').replaceAll('"', '')
          const data = dataString.toString().split('|');
          const dataItems = listToMatrix(data, secondHeaderCount).filter(list => list.length > 1);

          items = dataItems.map(list => {
            return {
              name: list[0],
              price: Math.floor(parseFloat(list[2]) * -100) / 100,
              amount: Math.floor(parseFloat(list[5]) * 100) / 100,
              shared: true,
              rejected: false
            }
          })
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
        <th>Reject</th>
        <th>Share</th>
      </tr>
    );
  }

  function generateTableRows(list: IListItem[], isFirstList: boolean): JSX.Element[] {
    const rows: JSX.Element[] = [];

    for (let i = 0; i < list.length; i++) {
      const item: IListItem = list[i];
      rows.push(
        <tr key={i}>
          <td>{item.name}</td>
          <td>{item.price} €</td>
          <td>{item.amount}</td>
          <td><input checked={item.rejected} type='checkbox' onChange={() => { toggleRejectItem(i, isFirstList) }}></input></td>
          <td><input checked={item.shared} type='checkbox' onChange={() => { toggleShareItem(i, isFirstList) }}></input></td>
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
                <div>Total rejected: </div>
                <div>{calcRejected(secondList)} €</div>
              </div>
              <div className={[styles.personTableSum].join(' ')}>
                <div>Person 2 personal stuff: </div>
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
