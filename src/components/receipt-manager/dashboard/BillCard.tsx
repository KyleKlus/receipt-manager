/** @format */
import styles from '@/styles/components/receipt-manager/dashboard/BillCard.module.css';
import { IAuthContext, RedirectPathOptions, redirectPaths, useAuth } from '@/context/AuthContext';
import { IUserDataBaseContext, useUserDB } from '@/context/UserDatabaseContext';
import Card from '../../Card';
import { Category } from '@/handlers/DataParser';
import * as DataParser from '@/handlers/DataParser';
import Image from 'next/image';
import plusIcon from '../../../../public/plus.png'
import IBill from '@/interfaces/data/IBill';
import { useRouter } from 'next/router';
import { IBillDataBaseContext, useBillDB } from '@/context/BillDatabaseContext';
import { IYearDataBaseContext, useYearDB } from '@/context/YearDatabaseContext';
import { IMonthDataBaseContext, useMonthDB } from '@/context/MonthDatabaseContext';
import { useEffect, useState } from 'react';


interface IShareSyncTokenModalProps {
    className?: string;
    bill?: IBill;
    isInDeleteMode?: boolean
    mostCommonCategory?: Category;
    reloadBills: () => void
}

export default function BillCard(props: React.PropsWithChildren<IShareSyncTokenModalProps>) {
    const authContext: IAuthContext = useAuth();
    const userDBContext: IUserDataBaseContext = useUserDB();
    const billDBContext: IBillDataBaseContext = useBillDB();
    const yearDBContext: IYearDataBaseContext = useYearDB();
    const monthDBContext: IMonthDataBaseContext = useMonthDB();

    const [isInDeleteMode, setIsInDeleteMode] = useState(props.isInDeleteMode);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setIsInDeleteMode(props.isInDeleteMode);
    }, [props]);

    const router = useRouter();

    function handleAddBill() {
        if (yearDBContext.currentYear === undefined || monthDBContext.currentMonth === undefined) {
            return;
        }
        billDBContext.addBill(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name).then(billName => {
            if (yearDBContext.currentYear === undefined || monthDBContext.currentMonth === undefined) { return; }
            props.reloadBills();
            router.push({
                pathname: redirectPaths[RedirectPathOptions.ManagerPage],
                query: { date: billName, token: userDBContext.selectedConnection, year: yearDBContext.currentYear.name, month: monthDBContext.currentMonth.name }
            });
        });
    }

    function handleOpenBill() {
        if (props.bill === undefined || yearDBContext.currentYear === undefined || monthDBContext.currentMonth
            === undefined) { return }
        router.push({
            pathname: redirectPaths[RedirectPathOptions.ManagerPage],
            query: { date: DataParser.getDateNameByMoment(props.bill.date), token: userDBContext.selectedConnection, year: yearDBContext.currentYear.name, month: monthDBContext.currentMonth.name }
        });
    }

    return (
        <Card className={[styles.billCard, props.bill !== undefined && styles.isEditable].join(' ')}>
            <div
                className={[styles.billCardWrapper].join(' ')}
                onClick={props.bill === undefined || (isInDeleteMode !== undefined && isInDeleteMode) ? () => { } : handleOpenBill}
            >
                <div className={[styles.billCardHeader].join(' ')}>
                    {props.bill === undefined
                        ? <h5>
                            {'Add bill'}
                        </h5>
                        : <>{isInDeleteMode !== undefined && isInDeleteMode && props.bill !== undefined
                            ? <h6>
                                {props.bill.date.format('DD.MM.YYYY | HH:mm')}
                            </h6>
                            : <h5>
                                {props.bill.date.format('DD.MM.YYYY | HH:mm')}
                            </h5>
                        }</>
                    }
                    {isInDeleteMode !== undefined && isInDeleteMode &&
                        <button disabled={isDeleting} className={[styles.deleteBillButton].join(' ')} onClick={async () => {
                            if (yearDBContext.currentYear === undefined || monthDBContext.currentMonth === undefined || props.bill === undefined) {
                                return;
                            }
                            setIsDeleting(true)
                            await billDBContext.deleteBill(authContext.user, userDBContext.selectedConnection, yearDBContext.currentYear.name, monthDBContext.currentMonth.name, props.bill).then((result) => {
                                setIsDeleting(false)
                                props.reloadBills()
                            });
                        }}>❌</button>
                    }

                </div>
                <div className={[styles.billCardContent].join(' ')}>
                    {!isDeleting &&
                        <>
                            {props.bill === undefined
                                ? <button className={[styles.addBillButton].join(' ')} type="button" onClick={handleAddBill}>
                                    <Image src={plusIcon} alt='add Bill' width={24} height={24} />
                                </button>
                                : <ul className={[styles.billInfos].join(' ')}>
                                    <li>Cost: {props.bill.totalPrice}€</li>
                                    <li>Items: {props.bill.numberOfItems}</li>
                                    <li>Category: {DataParser.getNameOfCategory(props.bill.mostCommonCategory)}</li>
                                </ul>
                            }
                        </>
                    }

                    {isDeleting &&
                        <div>Please wait until the deletion is done!</div>
                    }
                </div>
            </div>
        </Card>
    );
}
