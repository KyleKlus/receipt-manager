/** @format */
import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/container/Content';

import Main from '@/components/container/Main';

import headerStyles from '@/styles/components/header/Header.module.css'
import navLinkStyles from '@/styles/components/links/NavLink.module.css'

import styles from '@/styles/pages/LockedPage.module.css'

import ScrollNavLink from '@/components/links/ScrollNavLink';
import dynamic from 'next/dynamic';

import Card from '@/components/container/Card';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from 'templates/context/AuthContext';
import { IDataBaseContext, useDB } from 'templates/context/DatabaseContext';
import withAuth from '@/components/withAuth';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});

function Home() {
  const authContext: IAuthContext = useAuth();
  const dbContext: IUserDataBaseContext = useUserDB();

  const handleLogout = () => {
    authContext.logOut();
  };

  return (
    <>
      <Head>
        <title>Kyle Klus | Website</title>
        <meta
          name="description"
          content="Website of Kyle Klus."
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
      <Header >
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
      </Header >
      <Main>
        <div id={'top'}></div>
        <Content className={['applyHeaderOffset'].join(' ')}>
          <Card>
            {/* <button onClick={() => {
              if (authContext.user === null) { return; }
              dbContext.addUserDocument(authContext.user, authContext.user?.displayName + '_secrets', { secret: '42', uid: authContext.user?.uid });
            }}>Add a document</button>
            <button onClick={() => {
              if (authContext.user === null) { return; }
              dbContext.updateUserDocument(authContext.user, authContext.user?.displayName + '_secrets', { secret: '84', uid: authContext.user?.uid });
            }}>Update a document</button>
            <button onClick={() => {
              if (authContext.user === null) { return; }
              dbContext.deleteUserDocument(authContext.user, authContext.user?.displayName + '_secrets');
            }}>Delete a document</button>
            <button onClick={() => {
              if (authContext.user === null) { return; }
              dbContext.readUserDocument(authContext.user, authContext.user?.displayName + '_secrets');
            }}>Read a document</button> */}
          </Card>
        </Content>
        <Footer />
      </Main>
    </>
  );
}

export default withAuth(Home);
