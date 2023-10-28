/** @format */

import styles from '@/styles/components/links/NavLink.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface INavLinkProps {
  className?: string;
  pathName: string;
  displayText: string;
}

/**
 * A link, which shows if it leads to the current page
 * @param props
 * @returns
 */

export default function NavLink(props: React.PropsWithChildren<INavLinkProps>) {
  const router = useRouter();
  const lastBasePathElement: string = router.basePath.split('/').reverse()[0].replace('#', '');
  const lastPathNameElement: string = router.pathname.split('/').reverse()[0].replace('#', '');
  const lastPropsPathNameElement: string = props.pathName.split('/').reverse()[0].replace('#', '');
  const styleClass = lastPropsPathNameElement.endsWith(lastBasePathElement) || lastPropsPathNameElement.endsWith(lastPathNameElement) ? styles.isCurrentWindow : '';

  return (
    <Link
      className={styles.navLink + ' ' + styleClass + ' ' + props.className}
      href={props.pathName}
    >
      {props.displayText}
    </Link>
  );
}
