import { Button, Col, Row } from "react-bootstrap";
import AddTransactionModal from "./addTransactionModal";
import { useContext, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import TransactionsCalendar from "./transactionsCalendar";
import TransactionsTableLayout from "./transactionsTableLayout";

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
        <Row className="mx-auto d-flex justify-content-between my-4 text-center">
          <Col className="col-6">
            <Button
              variant="secondary"
              onClick={toggleTransactions}
              className="text-nowrap"
            >
              {buttonText}
            </Button>
          </Col>
          <Col className="col-6">
            <Button
              variant="primary"
              onClick={addTransaction}
              className="text-nowrap"
            >
              Add Transaction
            </Button>
          </Col>
        </Row>

        <Row className="d-flex">
          <Col className="col-12 col-xl-10 mx-auto">
            {view === VIEWS.CALENDAR && (
              <TransactionsCalendar dateInfo={dateInfo} />
            )}
            {view === VIEWS.TABLE && (
              <TransactionsTableLayout dateInfo={dateInfo} />
            )}
          </Col>
        </Row>

        <AddTransactionModal {...addTransactionModalProps} />
      </>
    );
  }
};

export default TransactionsLayout;
