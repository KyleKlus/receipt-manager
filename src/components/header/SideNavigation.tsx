/** @format */
import styles from '@/styles/components/header/SideNavigation.module.css';
import Card from '../Card';
import NavLink from './NavLink';
import ScrollNavLink from './ScrollNavLink';

interface ISideNavigationProps {
  isActive: boolean;
}
export default function SideNavigation(
  props: React.PropsWithChildren<ISideNavigationProps>
) {
  const isActiveClassName = props.isActive ? styles.isActive : styles.isDisabled;


  return (
    <nav className={styles.sideNavMenu + ' ' + isActiveClassName}>
      <Card className={styles.menuCard}>
        <h4>Main Site</h4>
        <ScrollNavLink
          className={styles.sideNavLink}
          elementName="/#heroPage"
          displayText="Home"
        />
        <ScrollNavLink
          className={styles.sideNavLink}
          elementName="/#portfolioPage"
          displayText="Portfolio"
        />
        <ScrollNavLink
          className={styles.sideNavLink}
          elementName="/#aboutPage"
          displayText="About"
        />
      </Card>
      {props.children}
    </nav>
  );
}
