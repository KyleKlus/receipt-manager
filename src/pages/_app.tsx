/** @format */
<<<<<<< HEAD
// Info: uncomment if you want to use firebase
'use client';
import AuthProvider from '@/context/AuthContext';
import UserDataBaseProvider from '@/context/UserDatabaseContext';
import BillDataBaseProvider from '@/context/BillDatabaseContext';
import AccountingDataBaseProvider from '@/context/AccountingDatabaseContext';
=======
// INFO: uncomment if you want to use firebase
/*
'use client';
import AuthProvider from 'templates/context/AuthContext';
import DataBaseProvider from 'templates/context/DatabaseContext';
*/
>>>>>>> 6e811787d8f1abe1fe8f2e0a2d49383afeb71eee
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Fira_Code } from "next/font/google";
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import YearDataBaseProvider from '@/context/YearDatabaseContext';
import MonthDataBaseProvider from '@/context/MonthDatabaseContext';

const firaCode = Fira_Code({ weight: '400', subsets: ['latin'] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <>
      <style
        jsx
        global
      >{`
        html {
          font-family: ${firaCode.style.fontFamily};
        }
      `}</style>
<<<<<<< HEAD
      <AuthProvider>
        <UserDataBaseProvider>
          <YearDataBaseProvider>
            <MonthDataBaseProvider>
              <BillDataBaseProvider>
                <AccountingDataBaseProvider>
                  {/* <Component {...pageProps} /> */}
                  {getLayout(<Component {...pageProps} />)}
                </AccountingDataBaseProvider>
              </BillDataBaseProvider>
            </MonthDataBaseProvider>
          </YearDataBaseProvider>
        </UserDataBaseProvider>
      </AuthProvider>
=======
      {/* INFO: Uncomment if you want to use firebase */}
      {/* <AuthProvider>
        <DataBaseProvider> */}
      <Component {...pageProps} />
      {/* </DataBaseProvider>
      </AuthProvider> */}
>>>>>>> 6e811787d8f1abe1fe8f2e0a2d49383afeb71eee
    </>

  );
}


// export default function App({ Component, pageProps }: AppProps) {
//   return (
//     <>
//       <style
//         jsx
//         global
//       >{`
//         html {
//           font-family: ${firaCode.style.fontFamily};
//         }
//       `}</style>
//       <AuthProvider>
//         <DataBaseProvider>
//           <Component {...pageProps} />
//         </DataBaseProvider>
//       </AuthProvider>
//     </>
//   );
// }
