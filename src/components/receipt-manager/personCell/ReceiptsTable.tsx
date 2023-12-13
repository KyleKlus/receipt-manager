/** @format */
import styles from '@/styles/components/receipt-manager/personCell/ReceiptsTable.module.css'
import { IReceipt } from '@/interfaces/data/IReceipt';
import { IReceiptItem } from '@/interfaces/data/IReceiptItem';
import { Category } from '@/handlers/DataParser';



export default function ReceiptsTable(props: {
    myName: string,
    otherName: string,
    isFirst: boolean,
    myReceipts: IReceipt[],
    toggleAllMyItems: (receiptNum: number, isFirst: boolean) => void;
    toggleAllSharedItems: (receiptNum: number, isFirst: boolean) => void;
    toggleAllRejectedItems: (receiptNum: number, isFirst: boolean) => void;
    selectCategoryForAllItems: (receiptNum: number, isFirst: boolean, selectCategory: Category) => void;
    toggleMyItem: (receiptNum: number, itemNum: number, isFirst: boolean) => void;
    toggleSharedItem: (receiptNum: number, itemNum: number, isFirst: boolean) => void;
    toggleRejectedItem: (receiptNum: number, itemNum: number, isFirst: boolean) => void;
    selectCategory: (receiptNum: number, itemNum: number, isFirst: boolean, selectCategory: Category) => void;
}) {
    const {
        myName,
        otherName,
        isFirst,
        myReceipts,
        toggleAllMyItems,
        toggleAllSharedItems,
        toggleAllRejectedItems,
        selectCategoryForAllItems,
        toggleMyItem,
        toggleSharedItem,
        toggleRejectedItem,
        selectCategory
    } = props;

    function generateTableHeader(isFirst: boolean, myName: string, otherName: string): JSX.Element {
        return (
            <tr>
                <th>Item / Store Name</th>
                <th>Price €</th>
                <th>Amount</th>
                <th >{isFirst ? myName : otherName}</th>
                <th>Shared</th>
                <th >{isFirst ? otherName : myName}</th>
                <th >Category</th>
            </tr>
        );
    }

    function generateTableRows(isFirst: boolean, myReceipts: IReceipt[]): JSX.Element[] {
        const keyChar: string = isFirst ? 'k' : 'n';
        let key: number = -1;
        const rows: JSX.Element[] = [];

        for (let receiptNum: number = 0; receiptNum < myReceipts.length; receiptNum++) {
            const receipt: IReceipt = myReceipts[receiptNum];
            const receiptItems: IReceiptItem[] = receipt.items;
            key++;


            rows.push(
                <tr key={keyChar + key}>
                    <td className={[styles.personTableCellHeader].join(' ')}><div>{receipt.store}</div></td>
                    <td className={[styles.personTableCellHeader].join(' ')}>{receipt.totalPrice + ' €'}</td>
                    <td className={[styles.personTableCellHeader].join(' ')}>{''}</td>
                    {isFirst &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input checked={receipt.isAllMine} type='radio' onChange={() => { toggleAllMyItems(receiptNum, isFirst) }} />
                        </td>
                    }
                    {!isFirst &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input checked={receipt.isAllRejected} type='radio' onChange={() => { toggleAllRejectedItems(receiptNum, isFirst) }} />
                        </td>
                    }
                    <td className={[styles.personTableCellHeader].join(' ')}>
                        <input checked={receipt.isAllShared} type='radio' onChange={() => { toggleAllSharedItems(receiptNum, isFirst) }} />
                    </td>
                    {!isFirst &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input checked={receipt.isAllMine} type='radio' onChange={() => { toggleAllMyItems(receiptNum, isFirst) }} />
                        </td>
                    }
                    {isFirst &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input checked={receipt.isAllRejected} type='radio' onChange={() => { toggleAllRejectedItems(receiptNum, isFirst) }} />
                        </td>
                    }
                    <td className={[styles.personTableCellHeader].join(' ')}>
                        {/* <select defaultValue={Category[receipt.categoryForAllItems]} onChange={(e) => {
                            // Parse the category from the select event
                            const categoryName: string = e.currentTarget.value;
                            const categoryIndex: number = (Object.keys(Category) as Array<keyof typeof Category>)
                                .slice((Object.keys(Category).length / 2))
                                .map((key) => { return key.toString() })
                                .indexOf(categoryName);
                            const selectedCategory: Category = categoryIndex;
                            selectCategoryForAllItems(receiptNum, isFirst, selectedCategory)
                        }}>
                            {(Object.keys(Category) as Array<keyof typeof Category>)
                                .slice((Object.keys(Category).length / 2))
                                .map((key, n) => { return (<option key={n} value={key}>{key}</option>) })}
                        </select> */}
                    </td>
                </tr>
            );


            rows.push(...receiptItems.map((item, itemNum) => {
                key++;
                return (<tr key={keyChar + key}>
                    <td className={[].join(' ')}><div>{item.name}</div></td>
                    <td className={[].join(' ')}>{item.price + ' €'}</td>
                    <td className={[].join(' ')}>{item.amount}</td>
                    {isFirst &&
                        <td className={[].join(' ')}>
                            <input checked={item.isMine} type='radio' onChange={() => { toggleMyItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }
                    {!isFirst &&
                        <td className={[].join(' ')}>
                            <input checked={item.isRejected} type='radio' onChange={() => { toggleRejectedItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }
                    <td className={[].join(' ')}>
                        <input checked={item.isShared} type='radio' onChange={() => { toggleSharedItem(receiptNum, itemNum, isFirst) }} />
                    </td>
                    {!isFirst &&
                        <td className={[].join(' ')}>
                            <input checked={item.isMine} type='radio' onChange={() => { toggleMyItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }
                    {isFirst &&
                        <td className={[].join(' ')}>
                            <input checked={item.isRejected} type='radio' onChange={() => { toggleRejectedItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }
                    <td className={[].join(' ')}>
                        <select defaultValue={Category[item.category]} onChange={(e) => {
                            // Parse the category from the select event
                            const categoryName: string = e.currentTarget.value;
                            const categoryIndex: number = (Object.keys(Category) as Array<keyof typeof Category>)
                                .slice((Object.keys(Category).length / 2))
                                .map((key) => { return key.toString() })
                                .indexOf(categoryName);
                            const selectedCategory: Category = categoryIndex;
                            selectCategory(receiptNum, itemNum, isFirst, selectedCategory)
                        }}>
                            {(Object.keys(Category) as Array<keyof typeof Category>)
                                .slice((Object.keys(Category).length / 2))
                                .map((key, n) => { return (<option key={n} value={key}>{key}</option>) })}
                        </select>
                    </td>
                </tr>)
            }));
            key++;
        }
        return rows;
    }

    return (
        <div className={[styles.receiptsTable].join(' ')}>
            <h3>{myName} Receipts</h3>
            <table className={[styles.table].join(' ')}>
                <thead>{generateTableHeader(isFirst, myName, otherName)}</thead>
                <tbody>
                    {...generateTableRows(isFirst, myReceipts)}
                </tbody>
            </table>
        </div>
    );
}
