/** @format */

import styles from '@/styles/components/header/Logo.module.css';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Logo() {
  const router = useRouter();

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        router.push('/');
      }}
      className={styles.logoWrapper}
    >
      <Image
        src={process.env.basePath + "/KK_Logo.svg"}
        alt="KK Logo"
        width={'42'}
        height={'42'}
        quality={100}
      ></Image>
      <p>Kyle Klus</p>
    </div>
  );
}
