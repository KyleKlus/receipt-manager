/** @format */
import styles from '@/styles/components/buttons/LanguageSelector.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ILanguageSelectorProps { }

export default function LanguageSelector(
  props: React.PropsWithChildren<ILanguageSelectorProps>
) {
  const [activeLanguage, setActiveLanguage] = useState(document.body.dataset.language);
  const inactiveLanguage = activeLanguage === 'de' ? 'en' : 'de';

  useEffect(() => {
    document.body.dataset.language = activeLanguage;
    localStorage.removeItem('language');
    window.localStorage.setItem('language', JSON.stringify(activeLanguage || '{}'));

  }, [activeLanguage]);

  return (
    <button
      className={styles.languageButton}
      onClick={() => setActiveLanguage(inactiveLanguage)}
    >
      <Image
        src={process.env.basePath + '/' + activeLanguage + '-mode.png'}
        alt=""
        width={'23'}
        height={'23'}
        quality={100}
      ></Image>
      {props.children}
    </button>
  );
}
