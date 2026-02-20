import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import TransactionSummaryModal from "./transactionSummaryModal";
import { useState } from "react";

const dateColumn = "col-3 col-md-2 col-lg-1";
const storeColumn = "col-6 col-md-6 col-lg-3";
const itemsColumn = "d-none d-lg-block col-lg-4";
const categoryColumn = "d-none d-md-block col-md-2";
const amountColumn = "col-3 col-md-2 text-end";

const TransactionsSummaryTableRow = ({ transaction }) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <tr className="d-flex clicker" onClick={openModal}>
        <td className={dateColumn}>{dateFormatter(transaction.date)}</td>
        <td className={storeColumn}>
          {transaction.store.length > 22
            ? transaction.store.slice(0, 22) + "..."
            : transaction.store}
        </td>
        <td className={itemsColumn}>
          {transaction.items.length > 30
            ? transaction.items.slice(0, 30) + "..."
            : transaction.items}
        </td>
        <td className={categoryColumn}>{transaction.category}</td>
        <td className={amountColumn}>
          <span className={transaction.amount < 0 ? "text-danger fw-bold" : ""}>
            {dollarFormatter(transaction.amount)}
          </span>
        </td>
      </tr>

      <TransactionSummaryModal
        transaction={transaction}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};

export default TransactionsSummaryTableRow;
