/** @format */
import styles from '@/styles/components/receipt-manager/ShareSyncTokenModal.module.css';
import Modal from '../Modal';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IDataBaseContext, useDB } from '@/context/DatabaseContext';

interface IShareSyncTokenModalProps {
    className?: string;
    backDropClassName?: string;
    isModalOpen: boolean;
    newPendingSyncToken: string;
    newActiveSyncToken: string;
    closeModal: () => void;
    generateNewPendingSyncToken: () => void;
    setNewActiveSyncToken: (token: string) => void;
    addActiveSyncToken: () => void;
}

export default function ShareSyncTokenModal(props: React.PropsWithChildren<IShareSyncTokenModalProps>) {
    const authContext: IAuthContext = useAuth();
    const dbContext: IDataBaseContext = useDB();
    return (
        <Modal
            contentClassName={[styles.addConnectionModal].join(' ')}
            modalClassName={[styles.addConnectionModalRoot].join()}
            isModalOpen={props.isModalOpen}
            closeModal={props.closeModal}
        >
            <p>Share the following &quot;syncToken&quot; with some one so the other person can connect with you:</p>
            <div className={[styles.tokenContainerWrapper].join(' ')}>
                <textarea className={[styles.tokenContainer].join(' ')} readOnly rows={1} value={props.newPendingSyncToken} />
                <button onClick={props.generateNewPendingSyncToken}>New</button>
            </div>

            <p>or</p>
            <p>Add a &quot;syncToken&quot; to connect yourself with somebody:</p>
            <div className={[styles.tokenContainerWrapper].join(' ')}>
                <input className={[styles.tokenContainer].join(' ')} type={'text'} value={props.newActiveSyncToken} onChange={(e) => {
                    props.setNewActiveSyncToken(e.currentTarget.value);
                }} />
                <button
                    onClick={props.addActiveSyncToken}
                >add</button>
            </div>
        </Modal>
    );
}
