/** @format */
import styles from '@/styles/components/buttons/SideNavigationButton.module.css';

interface ISideNavigationButtonProps {
  onClick?: any;
}

export default function SideNavigationButton(
  props: React.PropsWithChildren<ISideNavigationButtonProps>
) {
  return (
    <div
      className={styles.sideNav}
      onClick={props.onClick}
    >
      <span className={styles.bar}></span>
      <span className={styles.bar}></span>
      <span className={styles.bar}></span>
      {props.children}
    </div>
  );
}
