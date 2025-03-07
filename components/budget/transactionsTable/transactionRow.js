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
                <td className="col-2">{dateFormatter(transaction.date)}</td>
                <td className={"col-7 col-sm-4 cell"}>{transaction.store}</td>
                <td className={`d-none d-sm-block col-sm-3`}>{transaction.category}</td>
                {transaction.amount > 0 ? 
                        <td className="col-3 col-sm-3">{currencyFormatter.format(transaction.amount)}</td> 
                        : 
                        <td className="col-3 col-sm-3 text-danger">({currencyFormatter.format(Math.abs(transaction.amount))})</td>
                }
            </tr>

            { showDetails && <TransactionDetails {...transactionDetailsProps} />}
            { showEdit && <EditTransaction {...editTransactionProps} />}
            { showDelete && <DeleteTransaction {...deleteTransactionProps} />}
        </>
    );
};

export default TransactionRow;