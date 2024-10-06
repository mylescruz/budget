import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import TransactionDetails from "./transactionDetails";
import styles from "@/styles/transactionRow.module.css";
import DeleteTransaction from "./deleteTransactions";
import EditTransaction from "./editTransaction";

const TransactionRow = ({ transaction, categories, setCategories, updateTransactions, removeTransaction }) => {
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

    const detailsModal = <TransactionDetails transaction={transaction} showDetails={showDetails} setShowDetails={setShowDetails} openDelete={openDelete} openEdit={openEdit} />;
    const editModal = <EditTransaction transaction={transaction} showEdit={showEdit} setShowEdit={setShowEdit} setShowDetails={setShowDetails} categories={categories} setCategories={setCategories} updateTransactions={updateTransactions} />
    const deleteModal = <DeleteTransaction transaction={transaction} showDelete={showDelete} setShowDelete={setShowDelete} setShowDetails={setShowDetails} removeTransaction={removeTransaction} />

    return (
        <>
            <tr className={styles.cell} onClick={openDetails}>
                <td>{dateFormatter(transaction.date)}</td>
                <td>{transaction.store}</td>
                <td>{transaction.category}</td>
                <td>{currencyFormatter.format(transaction.amount)}</td>
            </tr>

            { showDetails && <>{detailsModal}</>}
            { showEdit && <>{editModal}</>}
            { showDelete && <>{deleteModal}</>}
        </>
    );
};

export default TransactionRow;