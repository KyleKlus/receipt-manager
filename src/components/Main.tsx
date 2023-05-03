/** @format */
import styles from '@/styles/components/Main.module.css';

interface IMainProps { }

export default function Main(props: React.PropsWithChildren<IMainProps>) {
  return <main className={styles.main}>{props.children}</main>;
}
