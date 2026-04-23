import { Button, Row } from "react-bootstrap";
import { useContext, useMemo, useState } from "react";
import TransactionsCalendar from "./transactionsCalendar";
import DeleteTransactionModal from "./deleteTransactionModal";
import TransactionDetailsModal from "./transactionDetailsModal/transactionDetailsModal";
import DataTableLayout from "@/components/ui/dataTableLayout/dataTableLayout";
import EditTransactionModal from "./editTransactionsModal/editTransactionModal";
import AddTransactionsModal from "./addTransactionsModal/addTransactionsModal";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import ErrorMessage from "@/components/ui/errorMessage";
import { BudgetContext } from "@/contexts/BudgetContext";

const TransactionsLayout = ({ dateInfo }) => {
  const { transactions, budgetRequest } = useContext(BudgetContext);

  const [view, setView] = useState({
    display: "Table",
    text: "View Calendar",
  });
  const [modal, setModal] = useState(false);
  const [chosenTransaction, setChosenTransaction] = useState(null);

  const formattedTransactions = useMemo(() => {
    if (!transactions) {
      return null;
    }

    return transactions
      .filter((transaction) => transaction.type !== TRANSACTION_TYPES.INCOME)
      .map((transaction) => {
        const formattedTransaction = {
          _id: transaction._id,
          date: transaction.date,
          amount: transaction.amount,
        };

        if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
          formattedTransaction.name = transaction.store;
          formattedTransaction.description = transaction.items;
          formattedTransaction.type = transaction.category;
        } else {
          formattedTransaction.name = `Transfer from ${transaction.fromAccount} to ${transaction.toAccount}`;
          formattedTransaction.description = transaction.desciption;
          formattedTransaction.type = transaction.type;
        }

        return formattedTransaction;
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
        <ErrorMessage message={budgetRequest.message} />
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
            disabled={budgetRequest.status === "error"}
          >
            {view.text}
          </Button>
          <Button
            variant="primary"
            onClick={openAddTransaction}
            className="text-nowrap"
            disabled={budgetRequest.status === "error"}
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
