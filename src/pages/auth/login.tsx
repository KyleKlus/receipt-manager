/** @format */

import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Content from '@/components/container/Content';
import Main from '@/components/container/Main';

import styles from '@/styles/pages/Login.module.css'

import Image from 'next/image';

import Card from '@/components/container/Card';
import { UserCredential } from 'firebase/auth';
import { useRouter } from 'next/router';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';

import googleLogo from '../../../public/google.png';
import { useState } from 'react';
import Link from 'next/link';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { user, loading } = useAuth();
  const dbContext: IUserDataBaseContext = useUserDB();

  const authContext: IAuthContext = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg('');
      authContext.googleSignIn();
    }
    catch (error) {
      setErrorMsg('Wrong credentials');
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredentials: UserCredential = await authContext.emailLogin(email, password);
      if (userCredentials.user !== null) {
        setErrorMsg('');
        dbContext.addUserToDB(userCredentials.user).then(_ => {
          router.push(redirectPaths[RedirectPathOptions.DashBoardPage]);
        });
      }
    }
    catch (error) {
      setErrorMsg('Wrong credentials');
    }
  };

  if (user) {
    dbContext.addUserToDB(user).then(_ => {
      router.push(redirectPaths[RedirectPathOptions.DashBoardPage]);
    });
  }

  return (
    <>
      <Head>
        <title>Kyle Klus | Login</title>
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
      <Main>
        <div id={'top'}></div>
        <Content className={['applyHeaderOffset', 'dotted'].join(' ')}>
          {!loading && !user &&
            <Card className={[styles.loginPageCard].join(' ')}>
              <h2>Receipt Manager</h2>
              <br />
              <br />
              <label className={[styles.textboxLabel].join(' ')}>E-Mail</label>
              <input className={[styles.textbox].join(' ')} type="text" placeholder='example@mail.com' value={email} onKeyDown={(e) => {
                if (e.key === 'Enter') { handleSignIn() }
              }} onChange={(e) => {
                setEmail(e.currentTarget.value);
              }} />
              <br />
              <label className={[styles.textboxLabel].join(' ')}>Password</label>
              <input className={[styles.textbox].join(' ')} type="password" placeholder='Password' value={password} onKeyDown={(e) => {
                if (e.key === 'Enter') { handleSignIn() }
              }} onChange={(e) => {
                setPassword(e.currentTarget.value);
              }} />
              <label className={[styles.textboxLabel, styles.errorLabel].join(' ')}>{errorMsg}</label>
              <br />
              <button className={[styles.loginButton].join(' ')} onClick={handleSignIn}>
                <h4>Login</h4>
              </button>
              <label className={[styles.textboxLabel, styles.smallInfoLabel].join(' ')}>Don&apos;t have an account yet? {<Link href={'/auth/register'}>Register</Link>}</label>
              <br />
              <br />
              <h4>Or</h4>
              <br />
              <button className={[styles.googleButton].join(' ')} onClick={handleGoogleSignIn}>
                <Image
                  src={googleLogo}
                  alt={'Google Logo'}
                  quality={100}
                  width={32}
                  height={32}
                />
                <h3>Sign in</h3>
              </button>
            </Card>
          }
        </Content>
        <Footer />
      </Main>
    </>
  );
}
