/** @format */
import styles from '@/styles/lib/components/interaction/forms/buttons/SideNavigationButton.module.css';

interface ISideNavigationButtonProps {
  onClick?: any;
  isActive: boolean;
}

export default function SideNavigationButton(
  props: React.PropsWithChildren<ISideNavigationButtonProps>
) {
  const isActiveClassName = props.isActive ? styles.isActive : styles.isDisabled;
  return (
    <div
      className={[styles.sideNav, 'buttonClass', isActiveClassName].join(' ')}
      onClick={props.onClick}
    >
      <span className={styles.bar}></span>
      <span className={styles.bar}></span>
      <span className={styles.bar}></span>
      {props.children}
    </div>
  );
}
