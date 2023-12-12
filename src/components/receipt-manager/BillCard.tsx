/** @format */
import styles from '@/styles/components/receipt-manager/BillCard.module.css';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IDataBaseContext, useDB } from '@/context/DatabaseContext';
import Card from '../Card';
import { Category } from '@/handlers/DataParser';
import Image from 'next/image';
import plusIcon from '../../../public/plus.png'
import IBill from '@/interfaces/IBill';
import * as DataParser from '../../handlers/DataParser';
import { useRouter } from 'next/router';


interface IShareSyncTokenModalProps {
    className?: string;
    bill?: IBill;
    mostCommonCategory?: Category;
    reloadBills: () => void
}

export default function BillCard(props: React.PropsWithChildren<IShareSyncTokenModalProps>) {
    const authContext: IAuthContext = useAuth();
    const dbContext: IDataBaseContext = useDB();
    const router = useRouter();

    function handleAddBill() {
        dbContext.addBill(authContext.user, dbContext.selectedConnection).then(billName => {
            props.reloadBills();
            router.push({
                pathname: redirectPaths[RedirectPathOptions.ManagerPage],
                query: { date: billName, token: dbContext.selectedConnection }
            });
        });
    }

    function handleOpenBill() {
        if (props.bill === undefined) { return }
        router.push({
            pathname: redirectPaths[RedirectPathOptions.ManagerPage],
            query: { date: DataParser.getDateNameByMoment(props.bill.date), token: dbContext.selectedConnection }
        });
    }

    return (
        <Card className={[styles.billCard, props.bill !== undefined && styles.isEditable].join(' ')}>
            <div
                className={[styles.billCardWrapper].join(' ')}
                onClick={props.bill === undefined ? () => { } : handleOpenBill}
            >
                <div className={[styles.billCardHeader].join(' ')}>
                    {props.bill === undefined
                        ? <h4>
                            {'Add bill'}
                        </h4>
                        : <h5>
                            {props.bill.date.format('DD.MM.YYYY | HH:mm')}
                        </h5>
                    }
                </div>
                <div className={[styles.billCardContent].join(' ')}>
                    {props.bill === undefined
                        ? <button className={[styles.addBillButton].join(' ')} type="button" onClick={handleAddBill}>
                            <Image src={plusIcon} alt='add Bill' width={24} height={24} />
                        </button>
                        : <ul className={[styles.billInfos].join(' ')}>
                            <li>Cost: {props.bill.totalPrice}</li>
                            <li>Items: {props.bill.numberOfItems}</li>
                            <li>Category: {DataParser.getNameOfCategory(props.bill.mostCommonCategory)}</li>
                        </ul>
                    }
                </div>
            </div>
        </Card>
    );
}
