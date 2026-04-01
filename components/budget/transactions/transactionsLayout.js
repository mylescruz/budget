import { Button, Row } from "react-bootstrap";
import { useContext, useMemo, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import TransactionsCalendar from "./transactionsCalendar";
import DeleteTransactionModal from "./deleteTransactionModal";
import TransactionDetailsModal from "./transactionDetailsModal/transactionDetailsModal";
import DataTableLayout from "@/components/ui/dataTableLayout/dataTableLayout";
import EditTransactionModal from "./editTransactionsModal/editTransactionModal";
import AddTransactionsModal from "./addTransactionsModal/addTransactionsModal";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

const TransactionsLayout = ({ dateInfo }) => {
  const { transactions } = useContext(TransactionsContext);
  const [view, setView] = useState({
    display: "Table",
    text: "View Calendar",
  });
  const [modal, setModal] = useState(false);
  const [chosenTransaction, setChosenTransaction] = useState(null);

  const formattedTransactions = useMemo(() => {
    return transactions.map((transaction) => {
      if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
        return {
          _id: transaction._id,
          date: transaction.date,
          name: transaction.store,
          description: transaction.items,
          type: transaction.category,
          amount: transaction.amount,
        };
      } else if (transaction.type === TRANSACTION_TYPES.TRANSFER) {
        return {
          _id: transaction._id,
          date: transaction.date,
          name: `Transfer from ${transaction.fromAccount} to ${transaction.toAccount}`,
          description: transaction.desciption,
          type: transaction.type,
          amount: transaction.amount,
        };
      } else {
        return null;
      }
    });
  }, [transactions]);

  const transactionColumns = {
    column1: "Date",
    column2: "Store",
    column3: "Category",
    column4: "Amount",
  };

  const toggleTransactions = () => {
    setView((prev) =>
      prev.display === "Calendar"
        ? {
            display: "Table",
            text: "View Calendar",
          }
        : {
            display: "Calendar",
            text: "View Table",
          },
    );
  };

  const openAddTransaction = () => {
    setModal("addTransaction");
  };

  const openTransactionDetails = (transactionId) => {
    const foundTransaction = transactions.find(
      (transaction) => transaction._id === transactionId,
    );

    setChosenTransaction({
      ...foundTransaction,
      oldCategory: foundTransaction.category,
      oldAmount: foundTransaction.amount,
    });

    setModal("transactionDetails");
  };

  if (!transactions) {
    return (
      <Row className="mt-4 text-center">
        <p className="fw-bold text-danger">
          &#9432; There was an error loading your transactions. Please try again
          later!
        </p>
      </Row>
    );
  } else {
    return (
      <>
        <div className="mx-auto my-4 d-flex flew-row justify-content-between">
          <Button
            variant="secondary"
            onClick={toggleTransactions}
            className="text-nowrap"
          >
            {view.text}
          </Button>
          <Button
            variant="primary"
            onClick={openAddTransaction}
            className="text-nowrap"
          >
            Add Transactions
          </Button>
        </div>

        <div>
          {view.display === "Calendar" && (
            <TransactionsCalendar
              dateInfo={dateInfo}
              setChosenTransaction={setChosenTransaction}
              setModal={setModal}
            />
          )}
          {view.display === "Table" && (
            <DataTableLayout
              data={formattedTransactions}
              columns={transactionColumns}
              type="transactions"
              openDetails={openTransactionDetails}
            />
          )}
        </div>

        {modal === "transactionDetails" && (
          <TransactionDetailsModal
            chosenTransaction={chosenTransaction}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "addTransaction" && (
          <AddTransactionsModal
            dateInfo={dateInfo}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "editTransaction" && (
          <EditTransactionModal
            chosenTransaction={chosenTransaction}
            dateInfo={dateInfo}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "deleteTransaction" && (
          <DeleteTransactionModal
            chosenTransaction={chosenTransaction}
            dateInfo={dateInfo}
            modal={modal}
            setModal={setModal}
          />
        )}
      </>
    );
  }
};

export default TransactionsLayout;
