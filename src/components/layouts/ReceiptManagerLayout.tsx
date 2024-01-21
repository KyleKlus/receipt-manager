/** @format */
import styles from '@/styles/components/layouts/Layout.module.css';

import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import dynamic from 'next/dynamic';
import Main from '@/components/container/Main';
import { RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import Content from '@/components/container/Content';
import { useRouter } from 'next/router';
import { useUserDB } from '@/context/UserDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
    ssr: false,
});

interface ILayoutProps {
    className?: string
}

export default function Layout(props: React.PropsWithChildren<ILayoutProps>) {
    const authContext = useAuth();
    const userDB = useUserDB();
    const yearDBContext: IYearDataBaseContext = useYearDB();
    const monthDBContext: IMonthDataBaseContext = useMonthDB();
    const router = useRouter();

    const handleLogout = () => {
        authContext.logOut();
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
            <Main>
                <Content className={[styles.layoutWrapper].join(' ')}>
                    <div className={[styles.sideBar].join(' ')}>
                        <div className={[styles.sideBarTop].join(' ')}>
                            <button
                                className={[
                                    styles.functionButton,
                                    applyCurrentWindowStyle(router.pathname, '/dashboard')
                                ].join(' ')}
                                onClick={() => {
                                    !isCurrentWindow(router.pathname, '/dashboard')
                                        && router.push('/dashboard')
                                }}
                            >📖</button>
                            <button
                                disabled={userDB.activeConnections.length === 0 && isCurrentWindow(router.pathname, redirectPaths[RedirectPathOptions.DashBoardPage]) || true}// TODO: remove after implementation
                                className={[
                                    styles.functionButton,
                                    applyCurrentWindowStyle(router.pathname, '/items')
                                ].join(' ')}
                                onClick={() => {
                                    !isCurrentWindow(router.pathname, '/items') && yearDBContext.currentYear !== undefined && monthDBContext.currentMonth !== undefined
                                        && router.push({ pathname: '/items', query: { token: userDB.selectedConnection, year: yearDBContext.currentYear.name, month: monthDBContext.currentMonth.name } })
                                }}
                            >📜</button>
                            <button
                                disabled={userDB.activeConnections.length === 0 && isCurrentWindow(router.pathname, redirectPaths[RedirectPathOptions.DashBoardPage]) || true}// TODO: remove after implementation
                                className={[
                                    styles.functionButton,
                                    applyCurrentWindowStyle(router.pathname, '/statistics')
                                ].join(' ')}
                                onClick={() => {
                                    !isCurrentWindow(router.pathname, '/statistics') && yearDBContext.currentYear !== undefined && monthDBContext.currentMonth !== undefined
                                        && router.push({ pathname: '/statistics', query: { token: userDB.selectedConnection, year: yearDBContext.currentYear.name, month: monthDBContext.currentMonth.name } })
                                }}
                            >📈</button>
                        </div>
                        <div className={[styles.sideBarBottom].join(' ')}>
                            <hr />
                            <ThemeButton />
                            <button className={[styles.sideBarUserButton].join(' ')} onClick={() => {
                                router.push(redirectPaths[RedirectPathOptions.SettingsPage]);
                            }}>
                                ⚙️
                            </button>
                            <button className={[styles.sideBarUserButton].join(' ')} onClick={handleLogout}>
                                🏃
                            </button>
                        </div>

                    </div>
                    <div className={[styles.layoutContent].join(' ')}>
                        <div id={'top'}></div>
                        {props.children}
                        <Footer />
                    </div>
                </Content>
            </Main>
        </>
    );
}

function isCurrentWindow(currentPath: string, buttonPath: string): boolean {
    const currentPathName: string = currentPath.split('/').reverse()[0].replace('#', '');
    const buttonPathName: string = buttonPath.split('/').reverse()[0].replace('#', '');

    return (buttonPathName.length === 0 && currentPathName.length === 0) ||
        (buttonPathName.length !== 0 && currentPathName.length !== 0 && buttonPathName.indexOf(currentPathName) !== -1);
}

function applyCurrentWindowStyle(currentPath: string, buttonPath: string): string {
    return isCurrentWindow(currentPath, buttonPath)
        ? styles.isCurrentWindow
        : '';
}
