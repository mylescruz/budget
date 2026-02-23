import { Button, Col, Row } from "react-bootstrap";
import AddTransactionModal from "./addTransactionModal";
import { useContext, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import TransactionsCalendar from "./transactionsCalendar";
import TransactionsTableLayout from "./transactionsTable/transactionsTableLayout";
import EditTransactionModal from "./editTransactionModal";
import DeleteTransactionModal from "./deleteTransactionModal";
import TransactionDetailsModal from "./transactionDetailsModal";

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
            <TransactionsTableLayout
              dateInfo={dateInfo}
              setChosenTransaction={setChosenTransaction}
              setModal={setModal}
            />
          )}
        </div>

        {modal === "transactionDetails" && chosenTransaction && (
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

        {modal === "editTransaction" && chosenTransaction && (
          <EditTransactionModal
            chosenTransaction={chosenTransaction}
            setChosenTransaction={setChosenTransaction}
            dateInfo={dateInfo}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "deleteTransaction" && chosenTransaction && (
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
