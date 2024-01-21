/** @format */
import styles from '@/styles/components/container/Content.module.css';

interface IContentProps {
  id?: string;
  className?: string
}

export default function Content(props: React.PropsWithChildren<IContentProps>) {
  return <div id={props.id} className={[styles.content, props.className].join(' ')}>{props.children}</div>;
}
