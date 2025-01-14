import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import TransactionDetails from "./transactionDetails";
import styles from "@/styles/transactionRow.module.css";
import DeleteTransaction from "./deleteTransactions";
import EditTransaction from "./editTransaction";

const TransactionRow = ({ transaction, updateTransaction, removeTransaction }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const openDetails = () => {
        setShowDetails(true);
    };

    const openDelete = () => {
        setShowDetails(false);
        setShowDelete(true);
    };

    const openEdit = () => {
        setShowDetails(false);
        setShowEdit(true);
    };    

    const transactionDetailsProps = { 
        transaction: transaction,
        showDetails: showDetails,
        setShowDetails: setShowDetails,
        openDelete: openDelete,
        openEdit: openEdit
    };
          
    const editTransactionProps = {
        transaction: transaction,
        showEdit: showEdit,
        setShowEdit: setShowEdit,
        setShowDetails: setShowDetails,
        updateTransaction: updateTransaction
    };

    const deleteTransactionProps = {
        transaction: transaction,
        showDelete: showDelete,
        setShowDelete: setShowDelete,
        setShowDetails: setShowDetails,
        removeTransaction: removeTransaction
    };

    return (
        <>
            <tr className={styles.cell} onClick={openDetails}>
                <td>{dateFormatter(transaction.date)}</td>
                <td>{transaction.store}</td>
                <td>{transaction.category}</td>
                {transaction.amount > 0 ? 
                        <td>{currencyFormatter.format(transaction.amount)}</td> 
                        : 
                        <td className="text-danger">({currencyFormatter.format(Math.abs(transaction.amount))})</td>
                }
            </tr>

            { showDetails && <TransactionDetails {...transactionDetailsProps} />}
            { showEdit && <EditTransaction {...editTransactionProps} />}
            { showDelete && <DeleteTransaction {...deleteTransactionProps} />}
        </>
    );
};

export default TransactionRow;