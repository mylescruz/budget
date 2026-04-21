import { useMemo, useState } from "react";
import TransactionSummaryModal from "./transactionSummaryModal";
import DataTableLayout from "@/components/ui/dataTableLayout/dataTableLayout";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

const TransactionsSummaryLayout = ({ transactions }) => {
  const [chosenTransaction, setChosenTransaction] = useState(null);
  const [modal, setModal] = useState("none");

  const formattedTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type !== TRANSACTION_TYPES.INCOME)
      .map((transaction) => {
        if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
          return {
            _id: transaction._id,
            type: transaction.type,
            date: transaction.date,
            name: transaction.store,
            description: transaction.items,
            type: transaction.category,
            amount: transaction.amount,
          };
        } else {
          return {
            _id: transaction._id,
            type: transaction.type,
            date: transaction.date,
            name: `Transfer from ${transaction.fromAccount} to ${transaction.toAccount}`,
            description: transaction.description,
            type: TRANSACTION_TYPES.TRANSFER,
            amount: transaction.amount,
          };
        }
      });
  }, [transactions]);

  const transactionColumns = {
    column1: "Date",
    column2: "Store",
    column3: "Category",
    column4: "Amount",
  };

  const openTransactionDetails = (transactionId) => {
    const foundTransaction = transactions.find(
      (transaction) => transaction._id === transactionId,
    );

    setChosenTransaction(foundTransaction);

    setModal("transactionDetails");
  };

  return (
    <>
      <DataTableLayout
        data={formattedTransactions}
        columns={transactionColumns}
        type={"transactions"}
        openDetails={openTransactionDetails}
      />

      {modal === "transactionDetails" && (
        <TransactionSummaryModal
          chosenTransaction={chosenTransaction}
          modal={modal}
          setModal={setModal}
        />
      )}
    </>
  );
};

export default TransactionsSummaryLayout;
