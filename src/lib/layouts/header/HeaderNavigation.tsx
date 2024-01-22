/** @format */
import styles from '@/styles/lib/components/layouts/header/HeaderNavigation.module.css';

interface IHeaderNavigationProps { }

export default function HeaderNavigation(props: React.PropsWithChildren<IHeaderNavigationProps>) {
  return (
    <nav className={styles.nav}>
      {props.children}
    </nav>
  );
}
