/** @format */
import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/Content';

import Main from '@/components/Main';

import headerStyles from '@/styles/components/header/Header.module.css'
import styles from '@/styles/Register.module.css'

import ScrollNavLink from '@/components/links/ScrollNavLink';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import Card from '@/components/Card';

import { initFirebase } from '@/services/firebase';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { getRedirectResult, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import firebase_auth from '@/services/firebaseAuth';
import { useRouter } from 'next/router';

import googleLogo from '../../../public/google.png';
import { useState } from 'react';
import Link from 'next/link';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});

initFirebase();

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const authContext: IAuthContext = useAuth();
  const router = useRouter();

  getRedirectResult(firebase_auth).then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    if (result === null) { return; }
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    // The signed-in user info.
    const user = result?.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
    router.push("/auth/locked-page");
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      router.push("/auth/loading-page");
      sessionStorage.setItem('startSignIn', 'true');
    }
    catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredentials: UserCredential = await authContext.emailRegister(email, password);
      if (userCredentials.user !== null) {
        setErrorMsg('');
        router.push(process.env.basePath + "/auth/locked-page");
      }
    }
    catch (error) {
      setErrorMsg('min. 6 characters, etc.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Kyle Klus | Register</title>
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
        <Content className={['applyHeaderOffset'].join(' ')}>
          <Card className={[styles.registerPageCard].join(' ')}>
            <h1>Register</h1>
            <br />
            <br />
            <label className={[styles.textboxLabel].join(' ')}>E-Mail</label>
            <input disabled={isLoading} className={[styles.textbox].join(' ')} type="text" placeholder='example@mail.com' value={email} onKeyDown={(e) => {
              if (e.key === 'Enter') { handleSignIn() }
            }} onChange={(e) => {
              setEmail(e.currentTarget.value);
            }} />
            <br />
            <label className={[styles.textboxLabel].join(' ')}>Password</label>
            <input disabled={isLoading} className={[styles.textbox].join(' ')} type="password" placeholder='Password' value={password} onKeyDown={(e) => {
              if (e.key === 'Enter') { handleSignIn() }
            }} onChange={(e) => {
              setPassword(e.currentTarget.value);
            }} />
            <label className={[styles.textboxLabel, styles.errorLabel].join(' ')}>{errorMsg}</label>
            <br />
            <br />
            <button disabled={isLoading} className={[styles.registerButton].join(' ')} onClick={handleSignIn}>
              <h2>Register</h2>
            </button>
            <label className={[styles.textboxLabel, styles.smallInfoLabel].join(' ')}>Already have an account? {<Link href={'/auth/login'}>Login</Link>}</label>
            <br />
            <br />
            <br />
            <h3>Or</h3>
            <br />
            <br />
            <button disabled={isLoading} className={[styles.googleButton].join(' ')} onClick={handleGoogleSignIn}>
              <Image
                src={googleLogo}
                alt={'Google Logo'}
                quality={100}
                width={32}
                height={32}
              />
              <h2>Sign in</h2>
            </button>
          </Card>
        </Content>
        <Footer />
      </Main>
    </>
  );
}
