/** @format */
import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/Content';

import Main from '@/components/Main';

import styles from '@/styles/ReceiptManager.module.css'
import headerStyles from '@/styles/components/header/Header.module.css'

import ScrollNavLink from '@/components/links/ScrollNavLink';
import dynamic from 'next/dynamic';

import { useState } from 'react';
import { IReceipt } from '@/interfaces/IReceipt';
import * as CSVParser from '@/handlers/DataParser';
import PersonCard from '@/components/personCell/PersonCard';
import ReceiptsTable from '@/components/personCell/ReceiptsTable';
import { Category } from '@/handlers/DataParser';
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

  return (
    <>
      <Head>
        <title>Kyle Klus | Receipt Manager 🧾</title>
        <meta
          name="description"
          content="Receipt Manager web app"
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
      <Header>
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
        <Footer />
      </Main>
    </>
  );
}
