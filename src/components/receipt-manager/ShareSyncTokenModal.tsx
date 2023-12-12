/** @format */
import styles from '@/styles/components/receipt-manager/ShareSyncTokenModal.module.css';
import Modal from '../Modal';
import { IAuthContext, useAuth } from '@/context/AuthContext';
import { IDataBaseContext, useDB } from '@/context/DatabaseContext';
import { useState, useRef, useEffect } from 'react';

interface IShareSyncTokenModalProps {
    className?: string;
    backDropClassName?: string;
    isModalOpen: boolean;

    setIsModalOpen: (state: boolean) => void;
    setIsLoading: (state: boolean) => void;
}

export default function ShareSyncTokenModal(props: React.PropsWithChildren<IShareSyncTokenModalProps>) {

    const [newActiveSyncToken, setNewActiveSyncToken] = useState('');
    const [newPendingSyncToken, setNewPendingSyncToken] = useState('');

    const newPendingSyncTokenRef = useRef('');

    const authContext: IAuthContext = useAuth();
    const dbContext: IDataBaseContext = useDB();
    return (
        <Modal
            contentClassName={[styles.addConnectionModal].join(' ')}
            modalClassName={[styles.addConnectionModalRoot].join()}
            isModalOpen={props.isModalOpen}
            closeModal={() => {
                setNewActiveSyncToken('');
                setNewPendingSyncToken('');
                newPendingSyncTokenRef.current = '';
                props.setIsLoading(false);
                props.setIsModalOpen(false);
            }}
        >
            <p>Share the following &quot;syncToken&quot; with some one so the other person can connect with you:</p>
            <div className={[styles.tokenContainerWrapper].join(' ')}>
                {newPendingSyncToken.length > 0 &&
                    <textarea className={[styles.tokenContainer].join(' ')} readOnly rows={1} value={newPendingSyncTokenRef.current} />
                }
                <button onClick={() => {
                    const newToken = dbContext.generateNewSyncToken(authContext.user);

                    dbContext.addPendingSyncToken(authContext.user, newToken).then(_ => {
                        newPendingSyncTokenRef.current = newToken;
                        setNewPendingSyncToken(newPendingSyncTokenRef.current);
                    })
                }}>Get new token</button>
            </div>

            <p>or</p>
            <p>Add a &quot;syncToken&quot; to connect yourself with somebody:</p>
            <div className={[styles.tokenContainerWrapper].join(' ')}>
                <input className={[styles.tokenContainer].join(' ')} type={'text'} value={newActiveSyncToken} onChange={(e) => {
                    setNewActiveSyncToken(e.currentTarget.value);
                }} />
                <button
                    onClick={() => {
                        dbContext.addActiveSyncToken(authContext.user, newActiveSyncToken).then(isSuccess => {
                            if (isSuccess) {
                                setNewActiveSyncToken('');
                                setNewPendingSyncToken('');
                                newPendingSyncTokenRef.current = '';
                                props.setIsLoading(true);
                                props.setIsModalOpen(false);
                            }
                        })
                    }}
                >add</button>
            </div>
        </Modal>
    );
}
