import { Button, Col, Row } from "react-bootstrap";
import TransactionsTable from "./transactionsTable";
import AddTransactionModal from "./addTransactionModal";
import { useContext, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import ErrorTransactionsTable from "./errorTransactionsTable";
import TransactionsCalendar from "./transactionsCalendar";

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
  const [addTransactionClicked, setAddTransactionClicked] = useState(false);

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

  const addTransaction = () => {
    setAddTransactionClicked(true);
  };

  const addTransactionModalProps = {
    dateInfo: dateInfo,
    addTransactionClicked: addTransactionClicked,
    setAddTransactionClicked: setAddTransactionClicked,
  };

  return (
    <>
      <div className="w-75 mx-auto d-flex justify-content-between my-2 text-center">
        <Button
          id="view-transactions-btn"
          variant="secondary"
          onClick={toggleTransactions}
          disabled={!transactions}
        >
          {buttonText}
        </Button>
        <Button
          id="add-transaction-btn"
          variant="primary"
          onClick={addTransaction}
          disabled={!transactions}
        >
          Add Transaction
        </Button>
      </div>

      {transactions ? (
        <>
          <Row className="d-flex">
            <Col className="col-12 col-xl-10 mx-auto">
              {view === VIEWS.CALENDAR && (
                <TransactionsCalendar dateInfo={dateInfo} />
              )}
              {view === VIEWS.TABLE && (
                <TransactionsTable dateInfo={dateInfo} />
              )}
            </Col>
          </Row>
        </>
      ) : (
        <ErrorTransactionsTable />
      )}

      <AddTransactionModal {...addTransactionModalProps} />
    </>
  );
};

export default TransactionsLayout;
