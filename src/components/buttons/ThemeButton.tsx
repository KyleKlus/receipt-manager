/** @format */
import styles from '@/styles/components/buttons/ThemeButton.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface IThemeButtonProps { }

export default function ThemeButton(
  props: React.PropsWithChildren<IThemeButtonProps>
) {
  const [activeTheme, setActiveTheme] = useState(document.body.dataset.theme);
  const inactiveTheme = activeTheme === 'light' ? 'dark' : 'light';

  useEffect(() => {
    document.body.dataset.theme = activeTheme;
    localStorage.removeItem('theme');
    window.localStorage.setItem('theme', JSON.stringify(activeTheme || '{}'));
  }, [activeTheme]);

  return (
    <button
      className={styles.themeButton}
      onClick={() => setActiveTheme(inactiveTheme)}
    >
      <Image
        src={process.env.basePath + '/' + activeTheme + '-mode.svg'}
        alt=""
        width={'16'}
        height={'16'}
        quality={100}
      ></Image>
      {props.children}
    </button>
  );
}
