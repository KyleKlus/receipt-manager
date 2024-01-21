/** @format */
import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/container/Content';

import Main from '@/components/container/Main';

import headerStyles from '@/styles/components/header/Header.module.css'
import styles from '@/styles/pages/LoadingPage.module.css'

import ScrollNavLink from '@/components/links/ScrollNavLink';
import dynamic from 'next/dynamic';

import { IAuthContext, useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});

export default function Home() {
  const authContext: IAuthContext = useAuth();

  return (
    <>
      <Head>
        <title>Kyle Klus | Loading ...</title>
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
        <ThemeButton />
      </Header >
      <Main>
        <div id={'top'}></div>
        <Content className={['applyHeaderOffset', styles.loadingPage, 'dotted'].join(' ')}>
          <div className={[styles.loadingImageWrapper].join(' ')}>

          </div>
          <Image
            src={process.env.basePath + "/KK_Logo.svg"}
            alt="KK Logo"
            width={'84'}
            height={'84'}
            quality={100}
            className={[styles.loadingImage].join(' ')}
          />
        </Content>
        <Footer />
      </Main>
    </>
  );
}
