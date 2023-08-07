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
import { IReceipt } from '@/interfaces/IReceipt';
import * as CSVParser from '@/handlers/CSVParser';
import PersonCard from '@/components/personCell/PersonCard';
import ReceiptsTable from '@/components/personCell/ReceiptsTable';
import { Category } from '@/handlers/CSVParser';
import { IReceiptItem } from '@/interfaces/IReceiptItem';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});



export default function Home() {
  const [firstPersonName, setFirstPersonName] = useState<string>('Person 1');
  const [firstReceipts, setFirstReceipts] = useState<IReceipt[]>([]);


  const [secondPersonName, setSecondPersonName] = useState<string>('Person 2');
  const [secondReceipts, setSecondReceipts] = useState<IReceipt[]>([]);

  function selectCategory(receiptNum: number, itemNum: number, isFrist: boolean, selectedCategory: Category) {
    const updatedList: IReceipt[] = isFrist ? firstReceipts : secondReceipts;

    updatedList[receiptNum].categoryForAllItems = Category.None;
    updatedList[receiptNum].items[itemNum].category = selectedCategory;

    isFrist ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
  }

  function toggleRejectItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
    const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    updatedList[receiptNum].isAllRejected = false;
    updatedList[receiptNum].isAllShared = false;
    updatedList[receiptNum].isAllMine = false;

    if (updatedList[receiptNum].items[itemNum].isMine === true) {
      updatedList[receiptNum].items[itemNum].isMine = false;
    };
    updatedList[receiptNum].items[itemNum].isRejected = !updatedList[receiptNum].items[itemNum].isRejected;
    updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isRejected;


    isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
  }

  function toggleShareItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
    const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;
    updatedList[receiptNum].isAllRejected = false;
    updatedList[receiptNum].isAllShared = false;
    updatedList[receiptNum].isAllMine = false;

    if (updatedList[receiptNum].items[itemNum].isRejected === true && !updatedList[receiptNum].items[itemNum].isShared === true) {
      updatedList[receiptNum].items[itemNum].isRejected = false;
    };
    updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isShared;
    updatedList[receiptNum].items[itemNum].isMine = updatedList[receiptNum].items[itemNum].isShared && updatedList[receiptNum].items[itemNum].isRejected;

    isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
  }

  function toggleMyItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
    const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    updatedList[receiptNum].isAllRejected = false;
    updatedList[receiptNum].isAllShared = false;
    updatedList[receiptNum].isAllMine = false;

    updatedList[receiptNum].items[itemNum].isMine = !updatedList[receiptNum].items[itemNum].isMine;
    updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isMine;
    updatedList[receiptNum].items[itemNum].isRejected = false;

    isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
  }


  function selectCategoryForAllItems(receiptNum: number, isFrist: boolean, selectedCategory: Category) {
    const updatedList: IReceipt[] = isFrist ? firstReceipts.slice(0) : secondReceipts.slice(0);

    updatedList[receiptNum].categoryForAllItems = selectedCategory;

    const tmpItems: IReceiptItem[] = updatedList[receiptNum].items.slice(0);

    tmpItems.forEach((item) => {
      item.category = selectedCategory;
    })

    updatedList[receiptNum].items = tmpItems;

    console.log(updatedList[receiptNum].items[0]);


    isFrist ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
  }

  function toggleAllRejectedItems(receiptNum: number, isFirstList: boolean) {
    const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    if (updatedList[receiptNum].isAllMine === true) {
      updatedList[receiptNum].isAllMine = false;
    };
    updatedList[receiptNum].isAllRejected = !updatedList[receiptNum].isAllRejected;
    updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllRejected;


    updatedList[receiptNum].items.forEach((item) => {
      item.isRejected = updatedList[receiptNum].isAllRejected;
      item.isShared = updatedList[receiptNum].isAllShared;
      item.isMine = updatedList[receiptNum].isAllMine;
    });

    isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
  }

  function toggleAllSharedItems(receiptNum: number, isFirstList: boolean) {
    const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    if (updatedList[receiptNum].isAllRejected === true && !updatedList[receiptNum].isAllShared === true) {
      updatedList[receiptNum].isAllRejected = false;
    };
    updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllShared;
    updatedList[receiptNum].isAllMine = updatedList[receiptNum].isAllShared && updatedList[receiptNum].isAllRejected;

    updatedList[receiptNum].items.forEach((item) => {
      item.isRejected = updatedList[receiptNum].isAllRejected;
      item.isShared = updatedList[receiptNum].isAllShared;
      item.isMine = updatedList[receiptNum].isAllMine;
    });

    isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
  }

  function toggleAllMyItems(receiptNum: number, isFirstList: boolean) {
    const updatedList: IReceipt[] = isFirstList ? firstReceipts : secondReceipts;

    updatedList[receiptNum].isAllMine = !updatedList[receiptNum].isAllMine;
    updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllMine;
    updatedList[receiptNum].isAllRejected = false;

    updatedList[receiptNum].items.forEach((item) => {
      item.isRejected = updatedList[receiptNum].isAllRejected;
      item.isShared = updatedList[receiptNum].isAllShared;
      item.isMine = updatedList[receiptNum].isAllMine;
    });

    isFirstList ? setFirstReceipts([...updatedList]) : setSecondReceipts([...updatedList]);
  }


  async function uploadFile(files: FileList | null, isFirst: boolean): Promise<void> {
    if (files !== null && files !== undefined) {
      let receipts: IReceipt[] = [];

      for (let i = 0; i < files.length; i++) {
        receipts = receipts.concat(await CSVParser.parseFileToReceipts(files[i], isFirst ? firstPersonName : secondPersonName));
      }
      if (isFirst) {
        setFirstReceipts([...receipts])
      } else {
        setSecondReceipts([...receipts])
      }
    }
  }

  function setReceipts(receipts: IReceipt[], isFirst: boolean) {
    if (isFirst) {
      setFirstReceipts([...receipts]);
    } else {
      setSecondReceipts([...receipts]);
    }
  }


  // function calcResult(list: IListItem[], isFirstResult: boolean): number {
  //   let myResult: number = 0;
  //   let otherResult: number = 0;

  //   let myRejectedResult: number = 0;
  //   let otherRejectedResult: number = 0;

  //   let mySharedResult: number = 0;
  //   let otherSharedResult: number = 0;

  //   const myList: IListItem[] = isFirstResult ? firstReceipts : secondReceipts;
  //   const otherList: IListItem[] = isFirstResult ? secondReceipts : firstReceipts;

  //   let mySharedItems: IListItem[] = myList.filter(item => { return item.shared });
  //   let otherSharedItems: IListItem[] = otherList.filter(item => { return item.shared });

  //   let myItems: IListItem[] = myList.filter(item => { return !item.rejected && !item.shared });
  //   let myRejectedItems = myList.filter(item => { return item.rejected });

  //   let otherItems: IListItem[] = otherList.filter(item => { return !item.rejected && !item.shared });
  //   let otherRejectedItems = otherList.filter(item => { return item.rejected });

  //   myItems.forEach(item => {
  //     myResult += item.price
  //   });

  //   otherItems.forEach(item => {
  //     otherResult += item.price
  //   });

  //   myRejectedItems.forEach(item => {
  //     myRejectedResult += item.price
  //   });

  //   otherRejectedItems.forEach(item => {
  //     otherRejectedResult += item.price
  //   });

  //   mySharedItems.forEach(item => {
  //     mySharedResult += Math.floor((item.price / 2) * 100) / 100
  //   });

  //   otherSharedItems.forEach(item => {
  //     otherSharedResult += Math.floor((item.price / 2) * 100) / 100
  //   });

  //   const myFinalResult = otherSharedResult + otherRejectedResult
  //   const otherFinalResult = mySharedResult + myRejectedResult

  //   return myFinalResult > otherFinalResult ? Math.floor((myFinalResult - otherFinalResult) * 100) / 100 : 0
  // }

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
          <div className={[styles.split].join(' ')}>
            <PersonCard
              myName={firstPersonName}
              otherName={secondPersonName}
              isFirst={true}
              myReceipts={firstReceipts}
              otherReceipts={secondReceipts}
              setPersonName={setFirstPersonName}
              setReceipts={setReceipts}
              uploadFile={uploadFile}
            />
            <PersonCard
              myName={secondPersonName}
              otherName={firstPersonName}
              isFirst={false}
              myReceipts={secondReceipts}
              otherReceipts={firstReceipts}
              setPersonName={setSecondPersonName}
              setReceipts={setReceipts}
              uploadFile={uploadFile}
            />
          </div>
          {firstReceipts.length !== 0 &&
            <ReceiptsTable
              myName={firstPersonName}
              otherName={secondPersonName}
              isFirst={true}
              myReceipts={firstReceipts}
              toggleAllMyItems={toggleAllMyItems}
              toggleAllSharedItems={toggleAllSharedItems}
              toggleAllRejectedItems={toggleAllRejectedItems}
              selectCategoryForAllItems={selectCategoryForAllItems}
              toggleMyItem={toggleMyItem}
              toggleSharedItem={toggleShareItem}
              toggleRejectedItem={toggleRejectItem}
              selectCategory={selectCategory}
            />
          }
          {secondReceipts.length !== 0 &&
            <ReceiptsTable
              myName={secondPersonName}
              otherName={firstPersonName}
              isFirst={false}
              myReceipts={secondReceipts}
              toggleAllMyItems={toggleAllMyItems}
              toggleAllSharedItems={toggleAllSharedItems}
              toggleAllRejectedItems={toggleAllRejectedItems}
              selectCategoryForAllItems={selectCategoryForAllItems}
              toggleMyItem={toggleMyItem}
              toggleSharedItem={toggleShareItem}
              toggleRejectedItem={toggleRejectItem}
              selectCategory={selectCategory}
            />
          }
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
