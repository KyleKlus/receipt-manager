/** @format */
import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/Content';

import Main from '@/components/Main';

import styles from '@/styles/ReceiptManager.module.css';
import headerStyles from '@/styles/components/header/Header.module.css';
import navLinkStyles from '@/styles/components/links/NavLink.module.css';

import ScrollNavLink from '@/components/links/ScrollNavLink';
import dynamic from 'next/dynamic';
import ReceiptManager from '@/components/receipt-manager/ReceiptManager';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IDataBaseContext, useDB } from '@/context/DatabaseContext';
import withAuth from '@/components/withAuth';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});


function Home() {
  const authContext: IAuthContext = useAuth();
  const dbContext: IDataBaseContext = useDB();

  const handleLogout = () => {
    authContext.logOut();
  };

  return (
    <>
      <Head>
        <title>Kyle Klus | Receipt Manager 🧾 - Dashboard</title>
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
          elementName="https://kyleklus.github.io/#heroPage"
          displayText="Home"
        />
        <ScrollNavLink
          className={headerStyles.headerNavLink}
          elementName="https://kyleklus.github.io/#portfolioPage"
          displayText="Portfolio"
        />
        <ScrollNavLink
          className={headerStyles.headerNavLink}
          elementName="https://kyleklus.github.io/#aboutPage"
          displayText="About"
        />
          <button onClick={handleLogout} className={[navLinkStyles.navLink].join(' ')}>Logout</button>
        <ThemeButton />
      </Header>
      <Main>
        <div id={'top'}></div>
        <Content className={['applyHeaderOffset'].join(' ')}>

        </Content>
        <Footer />
      </Main>
    </>
  );
}

export default withAuth(Home);
