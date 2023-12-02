/** @format */
// Info: uncomment if you want to use firebase
'use client';
import AuthProvider from '@/context/AuthContext';
import DataBaseProvider from '@/context/DatabaseContext';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Fira_Code } from "next/font/google";
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'

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
      <AuthProvider>
        <DataBaseProvider>
          {/* <Component {...pageProps} /> */}
          {getLayout(<Component {...pageProps} />)}
        </DataBaseProvider>
      </AuthProvider>
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
