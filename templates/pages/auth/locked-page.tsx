/** @format */
import Head from 'next/head';
import Footer from '@/lib/layouts/footer/Footer';
import Header from '@/lib/layouts/header/Header';
import Content from '@/lib/container/Content';

import Main from '@/lib/container/Main';

import headerStyles from '@/styles/lib/components/layouts/header/Header.module.css'
import navLinkStyles from '@/styles/lib/components/interaction/links/NavLink.module.css'

import styles from '@/styles/lib/pages/LockedPage.module.css'

import ScrollNavLink from '@/lib/interaction/links/ScrollNavLink';
import dynamic from 'next/dynamic';

import Card from '@/lib/container/Card';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from 'templates/context/AuthContext';
import { IDataBaseContext, useDB } from 'templates/context/DatabaseContext';
<<<<<<< HEAD
import withAuth from '@/components/withAuth';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
=======
import withAuth from '@/lib/withAuth';
>>>>>>> 6e811787d8f1abe1fe8f2e0a2d49383afeb71eee

const ThemeButton = dynamic(() => import('@/lib/interaction/forms/buttons/ThemeButton'), {
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
