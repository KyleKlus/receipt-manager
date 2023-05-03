/** @format */
import styles from '@/styles/components/buttons/ScrollUpButton.module.css';
import Image from 'next/image';

interface IScrollUpButtonProps {
  isVisible: boolean;
}

export default function ScrollUpButton(
  props: React.PropsWithChildren<IScrollUpButtonProps>
) {
  const isVisibleClassName = props.isVisible ? ' ' + styles.isVisible : '';
  return (
    <button
      className={styles.scrollButton + isVisibleClassName}
      onClick={() => {
        const top = document.getElementById('top');
        if (top) { top.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" }); }
      }}
    >
      <Image id={'scroll-up-button-image'} className={[styles.image].join(' ')} alt='ScrollUpArrow' src={process.env.basePath + '/up-arrow.svg'} width={22} height={22}></Image>
      {props.children}
    </button>
  );
}
