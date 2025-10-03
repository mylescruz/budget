import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import DeleteTransactionModal from "./deleteTransactionModal";
import EditTransactionModal from "./editTransactionModal";
import TransactionDetailsModal from "./transactionDetailsModal";
import centsToDollars from "@/helpers/centsToDollars";

const TransactionsTableRow = ({ transaction, dateInfo }) => {
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

  const transactionDetailsModalProps = {
    transaction: transaction,
    showDetails: showDetails,
    setShowDetails: setShowDetails,
    openDelete: openDelete,
    openEdit: openEdit,
  };

  const editTransactionModalProps = {
    transaction: transaction,
    dateInfo: dateInfo,
    showEdit: showEdit,
    setShowEdit: setShowEdit,
    setShowDetails: setShowDetails,
  };

  const deleteTransactionModalProps = {
    transaction: transaction,
    dateInfo: dateInfo,
    showDelete: showDelete,
    setShowDelete: setShowDelete,
    setShowDetails: setShowDetails,
  };

  return (
    <>
      <tr className="d-flex click" onClick={openDetails}>
        <td className="col-3 col-md-2 col-lg-1">
          {dateFormatter(transaction.date)}
        </td>
        <td className="col-6 col-md-5 col-lg-4">
          <>
            <span className="d-sm-none">
              {transaction.store.length > 15
                ? transaction.store.slice(0, 15) + "..."
                : transaction.store}
            </span>
            <span className="d-none d-sm-block d-md-none">
              {transaction.store.length > 25
                ? transaction.store.slice(0, 25) + "..."
                : transaction.store}
            </span>
            <span className="d-none d-md-block d-lg-none">
              {transaction.store.length > 30
                ? transaction.store.slice(0, 30) + "..."
                : transaction.store}
            </span>
            <span className="d-none d-lg-block d-xl-none">
              {transaction.store.length > 35
                ? transaction.store.slice(0, 35) + "..."
                : transaction.store}
            </span>
            <span className="d-none d-xl-block">
              {transaction.store.length > 40
                ? transaction.store.slice(0, 40) + "..."
                : transaction.store}
            </span>
          </>
        </td>
        <td className="d-none d-lg-block col-lg-4">
          <span className="d-none d-lg-block d-xl-none">
            {transaction.items.length > 30
              ? transaction.items.slice(0, 30) + "..."
              : transaction.items}
          </span>
          <span className="d-none d-xl-block">
            {transaction.items.length > 35
              ? transaction.items.slice(0, 35) + "..."
              : transaction.items}
          </span>
        </td>
        <td className="d-none d-md-block col-md-3 col-lg-2">
          {transaction.category}
        </td>
        <td
          className={`col-3 col-md-2 col-lg-1 ${
            transaction.amount < 0 && "text-danger"
          }`}
        >
          {centsToDollars(transaction.amount)}
        </td>
      </tr>

      {showDetails && (
        <TransactionDetailsModal {...transactionDetailsModalProps} />
      )}
      {showEdit && <EditTransactionModal {...editTransactionModalProps} />}
      {showDelete && (
        <DeleteTransactionModal {...deleteTransactionModalProps} />
      )}
    </>
  );
};

export default TransactionsTableRow;
