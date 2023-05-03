/** @format */

import styles from '@/styles/components/footer/Footer.module.css';
import Link from 'next/link';

interface IFooterProps { }

export default function Footer(props: React.PropsWithChildren<IFooterProps>) {
  return (
    <>
      <footer className={styles.footer}>
        <p>
          Copyright © 2023{' '}
          <Link href={'https://github.com/MajorEnkidu'}>Kyle Klus</Link>
        </p>
        <div className={styles.navLinkWrapper}>
          {props.children}
        </div>
      </footer>
    </>
  );
}
