import { Button, Row } from "react-bootstrap";
import AddTransactionModal from "./addTransactionModal/addTransactionModal";
import { useContext, useMemo, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import TransactionsCalendar from "./transactionsCalendar";
import EditTransactionModal from "./editTransactionModal";
import DeleteTransactionModal from "./deleteTransactionModal";
import TransactionDetailsModal from "./transactionDetailsModal";
import DataTableLayout from "@/components/layout/dataTableLayout/dataTableLayout";

const VIEWS_LABEL = {
  CALENDAR: "View Calendar",
  TABLE: "View Table",
};
const VIEWS = {
  CALENDAR: "CALENDAR",
  TABLE: "TABLE",
};

const TransactionsLayout = ({ dateInfo }) => {
  const { transactions } = useContext(TransactionsContext);
  const [view, setView] = useState(VIEWS.CALENDAR);
  const [buttonText, setButtonText] = useState(VIEWS_LABEL.TABLE);
  const [modal, setModal] = useState(false);
  const [chosenTransaction, setChosenTransaction] = useState(null);

  const formattedTransactions = useMemo(() => {
    return transactions.map((transaction) => {
      console.log(transaction);
      if (transaction.type === "Expense") {
        return {
          _id: transaction._id,
          date: transaction.date,
          name: transaction.store,
          description: transaction.items,
          type: transaction.category,
          amount: transaction.amount,
        };
      } else if (transaction.type === "Transfer") {
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

  console.log("trans: ", formattedTransactions);

  const transactionColumns = {
    column1: "Date",
    column2: "Store",
    column3: "Category",
    column4: "Amount",
  };

  const toggleTransactions = () => {
    setView((prev) => {
      if (prev === VIEWS.CALENDAR) {
        return VIEWS.TABLE;
      } else {
        return VIEWS.CALENDAR;
      }
    });

    setButtonText((prev) => {
      if (prev === VIEWS_LABEL.CALENDAR) {
        return VIEWS_LABEL.TABLE;
      } else {
        return VIEWS_LABEL.CALENDAR;
      }
    });
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
            {buttonText}
          </Button>
          <Button
            variant="primary"
            onClick={openAddTransaction}
            className="text-nowrap"
          >
            Add Transaction
          </Button>
        </div>

        <div>
          {view === VIEWS.CALENDAR && (
            <TransactionsCalendar
              dateInfo={dateInfo}
              setChosenTransaction={setChosenTransaction}
              setModal={setModal}
            />
          )}
          {view === VIEWS.TABLE && (
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
          <AddTransactionModal
            dateInfo={dateInfo}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "editTransaction" && (
          <EditTransactionModal
            chosenTransaction={chosenTransaction}
            setChosenTransaction={setChosenTransaction}
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
