import { useMemo, useState } from "react";
import TransactionSummaryModal from "./transactionSummaryModal";
import DataTableLayout from "@/components/layout/dataTableLayout/dataTableLayout";

const TransactionsSummaryLayout = ({ transactions }) => {
  const [chosenTransaction, setChosenTransaction] = useState(null);
  const [modal, setModal] = useState("none");

  console.log(transactions);
  const formattedTransactions = useMemo(() => {
    return transactions.map((transaction) => {
      return {
        _id: transaction._id,
        date: transaction.date,
        name: transaction.store,
        description: transaction.items,
        type: transaction.category,
        amount: transaction.amount,
      };
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
