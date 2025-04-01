import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import TransactionDetails from "./transactionDetails";
import DeleteTransaction from "./deleteTransactions";
import EditTransaction from "./editTransaction";

const TransactionRow = ({ transaction, putTransaction, deleteTransaction, monthInfo }) => {
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
        monthInfo: monthInfo,
        showEdit: showEdit,
        setShowEdit: setShowEdit,
        setShowDetails: setShowDetails,
        putTransaction: putTransaction
    };

    const deleteTransactionProps = {
        transaction: transaction,
        showDelete: showDelete,
        setShowDelete: setShowDelete,
        setShowDetails: setShowDetails,
        deleteTransaction: deleteTransaction
    };

    return (
        <>
            <tr className="d-flex click" onClick={openDetails}>
                <td className="col-3 col-md-2 col-lg-1">{dateFormatter(transaction.date)}</td>
                <td className="col-6 col-md-5 col-lg-4">
                    <>
                        <span className="d-sm-none">{transaction.store.length > 15 ? (transaction.store.slice(0,15)+"...") : transaction.store}</span>
                        <span className="d-none d-sm-block d-md-none">{transaction.store.length > 25 ? (transaction.store.slice(0,25)+"...") : transaction.store}</span>
                        <span className="d-none d-md-block">{transaction.store.length > 30 ? (transaction.store.slice(0,30)+"...") : transaction.store}</span>
                    </>
                </td>
                <td className="d-none d-lg-block col-lg-4">
                    {transaction.items.length > 30 ?
                        <span>{transaction.items.slice(0,30)}...</span>
                        :
                        <span>{transaction.items}</span>
                    }
                </td>
                <td className="d-none d-md-block col-md-3 col-lg-2">{transaction.category}</td>
                <td className={`col-3 col-md-2 col-lg-1 ${transaction.amount < 0 && "text-danger"}`}>{currencyFormatter.format(transaction.amount)}</td> 
            </tr>

            { showDetails && <TransactionDetails {...transactionDetailsProps} />}
            { showEdit && <EditTransaction {...editTransactionProps} />}
            { showDelete && <DeleteTransaction {...deleteTransactionProps} />}
        </>
    );
};

export default TransactionRow;