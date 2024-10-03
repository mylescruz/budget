import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import TransactionDetails from "./transactionDetails";
import styles from "@/styles/transactionRow.module.css";

const TransactionRow = ({ transaction, categories, updateTransactions }) => {
    const [showDetails, setDetails] = useState(false);

    const detailsModal = <TransactionDetails transaction={transaction} showDetails={showDetails} setDetails={setDetails} categories={categories} updateTransactions={updateTransactions} />;

    const openDetails = () => {
        setDetails(true);
    };

    return (
        <>
            <tr className={styles.pointer} onClick={openDetails}>
                <td>{dateFormatter(transaction.date)}</td>
                <td className={styles.overflow}>{transaction.store}</td>
                <td className={styles.overflow}>{transaction.category}</td>
                <td className={styles.overflow}>{currencyFormatter.format(transaction.amount)}</td>
            </tr>

            {showDetails && <>{detailsModal}</>}
        </>
    );
};

export default TransactionRow;