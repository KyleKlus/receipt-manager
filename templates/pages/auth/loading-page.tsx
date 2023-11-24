/** @format */
import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/Content';

import Main from '@/components/Main';

import headerStyles from '@/styles/components/header/Header.module.css'

import styles from '@/styles/LoadingPage.module.css'

import ScrollNavLink from '@/components/links/ScrollNavLink';
import dynamic from 'next/dynamic';

import { IAuthContext, useAuth } from 'templates/context/AuthContext';
import { useRouter } from 'next/router';
import { GoogleAuthProvider, getRedirectResult } from 'firebase/auth';
import firebase_auth from 'templates/services/firebaseAuth';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';



const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});

export default function Home() {
  const authContext: IAuthContext = useAuth();
  const router = useRouter();
  // TODO: redirect if wrong use of loading page
  // const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const startSignIn: string | null = sessionStorage.getItem('startSignIn');
    if (startSignIn !== null) {
      sessionStorage.removeItem('startSignIn')
      authContext.googleSignIn();
      // clearTimeout(timerRef.current);
    } else {
      // timerRef.current = setTimeout(() => { router.push(process.env.basePath + "/auth/login"); }, 10000);
    }
  });

  getRedirectResult(firebase_auth).then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    if (result !== null) {
      // clearTimeout(timerRef.current);
      router.push(process.env.basePath + "/auth/locked-page");
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // The signed-in user info.
      const user = result?.user;
      // IdP data available using getAdditionalUserInfo(result)
    }
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // clearTimeout(timerRef.current);
    router.push(process.env.basePath + "/auth/login");

    // ...
  });

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
