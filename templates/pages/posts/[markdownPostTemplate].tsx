/** @format */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownSection from '@/components/MarkdownSection';
import Markdown from 'markdown-to-jsx';


import Head from 'next/head';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Content from '@/components/Content';

import Main from '@/components/Main';

import headerStyles from '@/styles/components/header/Header.module.css'
import sideNavStyles from '@/styles/components/header/SideNavigation.module.css'
import footerStyles from '@/styles/components/footer/Footer.module.css'

import ScrollNavLink from '@/components/header/ScrollNavLink';
import dynamic from 'next/dynamic';

import Card from '@/components/Card';
import NavLink from '@/components/header/NavLink';

import Link from 'next/link';
import IPost from '@/interfaces/IPost';
import { GetStaticPropsContext } from 'next/types';

const ThemeButton = dynamic(() => import('@/components/buttons/ThemeButton'), {
  ssr: false,
});

export default function MarkdownPostListTemplate(props: IPost) {
  return (
    <>
      <Head>
        <title>Kyle Klus | {props.frontmatter.title}</title>
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
      <Header>
        <ScrollNavLink
          className={headerStyles.headerNavLink}
          elementName="https://majorenkidu.github.io/#heroPage"
          displayText="Home"
        />
        <ScrollNavLink
          className={headerStyles.headerNavLink}
          elementName="https://majorenkidu.github.io/#portfolioPage"
          displayText="Portfolio"
        />
        <ScrollNavLink
          className={headerStyles.headerNavLink}
          elementName="https://majorenkidu.github.io/#aboutPage"
          displayText="About"
        />
        <ThemeButton />
      </Header>
      <Main>
        <div id={'top'}></div>
        <Content className={['applyHeaderOffset'].join(' ')}>
          <Markdown options={{ wrapper: MarkdownSection, forceWrapper: true }}>{props.content}</Markdown>
        </Content>
        <Footer>
          <ScrollNavLink
            className={footerStyles.footerNavLink}
            elementName="https://majorenkidu.github.io/#heroPage"
            displayText="Home"
          />
          <ScrollNavLink
            className={footerStyles.footerNavLink}
            elementName="https://majorenkidu.github.io/#portfolioPage"
            displayText="Portfolio"
          />
          <ScrollNavLink
            className={footerStyles.footerNavLink}
            elementName="https://majorenkidu.github.io/#aboutPage"
            displayText="About"
          />
          <Link href={'https://github.com/MajorEnkidu'} className={footerStyles.footerNavLink}>GitHub</Link>
          <Link href={'https://www.linkedin.com/in/kyle-klus-9a2588275'} className={footerStyles.footerNavLink}>LinkedIn</Link>
          <Link href={'https://ko-fi.com/majorenkidu'} className={footerStyles.footerNavLink}>Ko-fi</Link>
          <Link href={'mailto:kyle.klus.2@gmail.com'} className={footerStyles.footerNavLink}>Contact</Link>
          <NavLink
            className={footerStyles.sideNavLink + ' ' + footerStyles.footerNavLink}
            pathName="https://majorenkidu.github.io/privacy"
            displayText="Privacy"
          />
        </Footer>
      </Main>
    </>
  );
}

export async function getStaticPaths() {
  const folder = 'posts/'
  const filenames = fs.readdirSync(folder)
  const markdownFilenames = filenames.filter(file => file.endsWith('.md')).map(filename => '/' + folder + filename).map(filename => filename.replace('.md', ''))
  return {
    paths: markdownFilenames,
    fallback: false
  }
}

export async function getStaticProps({ params }: GetStaticPropsContext) {

  // get files
  const folder = 'posts/'
  const delimiter = '---'
  if (!params || !params.markdownPostTemplate || Array.isArray(params.markdownPostTemplate)) return { props: {} };

  const filename = params.markdownPostTemplate + '.md'

  const slug = params.markdownPostTemplate
  const path = `${folder}${filename}`
  const buffer = fs.readFileSync(path, 'utf-8')
  let fileContent = buffer.toString();
  let frontmatter = {}

  if (fileContent.startsWith(delimiter)) {
    frontmatter = matter(fileContent).data
    const startOfFrontmatter = fileContent.indexOf(delimiter)
    const endOfFrontmatter = fileContent.indexOf(delimiter, startOfFrontmatter + delimiter.length) + delimiter.length
    fileContent = fileContent.substring(endOfFrontmatter, fileContent.length)
  }

  return {
    props: {
      name: filename,
      slug: slug,
      path: path,
      frontmatter: frontmatter,
      content: fileContent
    }
  }
}
