/** @format */
import styles from '@/styles/components/container/Modal.module.css';
import closeIcon from '../../../public/close.png';
import Image from 'next/image';

interface IModalProps {
  modalClassName?: string;
  contentClassName?: string;
  backDropClassName?: string;
  isModalOpen: boolean;
  closeModal: () => void;
}

export default function Modal(props: React.PropsWithChildren<IModalProps>) {

  return (
    <div className={[
      styles.modalRoot,
      !props.isModalOpen && styles.closed,
      props.backDropClassName
    ].join(' ')}>
      <div className={[styles.modal, props.modalClassName].join(' ')}>
        <button className={[styles.closeButton].join(' ')} type="button" onClick={props.closeModal}>
          <Image src={closeIcon} alt='close' width={12} height={12} />
        </button>
        <div className={[styles.modalContent, props.contentClassName].join(' ')}>
          {props.children}
        </div>
      </div>
    </div>
  );
}
