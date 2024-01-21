/** @format */
import styles from '@/styles/components/layouts/Layout.module.css';

import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/container/Content';

import Main from '@/components/container/Main';

import headerStyles from '@/styles/components/header/Header.module.css'
import sideNavStyles from '@/styles/components/header/SideNavigation.module.css'

import ScrollNavLink from '@/components/links/ScrollNavLink';
import dynamic from 'next/dynamic';

import NavLink from '@/components/links/NavLink';
import Card from '@/components/container/Card';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
    ssr: false,
});

interface ILayoutProps {
    title?: string;
    className?: string;
}

export default function Layout(props: React.PropsWithChildren<ILayoutProps>) {
    return (
        <>
            <Head>
                <title>{'Kyle Klus | ' + props.title !== undefined ? props.title : 'Website'}</title>
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
                {props.children}
                <Footer />
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
