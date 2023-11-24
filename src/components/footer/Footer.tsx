/** @format */

import styles from '@/styles/components/footer/Footer.module.css';
import Link from 'next/link';
import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal } from 'react';

interface IFooterProps {
  className?: string;
  overrideContent?: ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal;
}

export default function Footer(props: React.PropsWithChildren<IFooterProps>) {
  return (
    <>
      <footer className={[styles.footer, props.className].join(' ')}>
        {props.overrideContent
          ? props.overrideContent
          : <div className={styles.footerContent}>
            <p>
              {'Copyright © 2023 '}
              <Link href={'https://github.com/KyleKlus'} className={['hoverBGEffect'].join(' ')} style={{ padding: '0 2px' }}>Kyle Klus</Link>
            </p>
            <div className={styles.navLinkWrapper}>
              <Link href={'https://kyleklus.github.io/#heroPage'} className={styles.footerNavLink}>Home</Link>
              <Link href={'https://kyleklus.github.io/#portfolioPage'} className={styles.footerNavLink}>Portfolio</Link>
              <Link href={'https://kyleklus.github.io/#aboutPage'} className={styles.footerNavLink}>About</Link>
              <Link href={'https://github.com/KyleKlus'} className={styles.footerNavLink}>GitHub</Link>
              <Link href={'https://www.linkedin.com/in/kyle-klus-9a2588275'} className={styles.footerNavLink}>LinkedIn</Link>
              <Link href={'https://ko-fi.com/majorenkidu'} className={styles.footerNavLink}>Ko-fi</Link>
              <Link href={'mailto:kyle.klus.2@gmail.com'} className={styles.footerNavLink}>Contact</Link>
              <Link href={'https://kyleklus.github.io/privacy'} className={styles.footerNavLink}>Privacy</Link>
              <Link href={'https://kyleklus.github.io/terms-of-service'} className={styles.footerNavLink}>Terms of Service</Link>
              {props.children}
            </div>
          </div>
        }
      </footer>
    </>
  );
}
