import { Button, Col, Row } from "react-bootstrap";
import TransactionsTable from "./transactionsTable";
import AddTransactionModal from "./addTransactionModal";
import { useContext, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import ErrorTransactionsTable from "./errorTransactionsTable";
import TransactionsCalendar from "./transactionsCalendar";

const CALENDAR_TEXT = "View Calendar";
const TABLE_TEXT = "View Table";

const TransactionsLayout = ({ dateInfo }) => {
  const { transactions } = useContext(TransactionsContext);
  const [calendarView, setCalendarView] = useState(true);
  const [toggleText, setToggleText] = useState(TABLE_TEXT);
  const [addTransactionClicked, setAddTransactionClicked] = useState(false);

  const toggleTransactions = () => {
    if (calendarView) {
      setCalendarView(false);
      setToggleText(CALENDAR_TEXT);
    } else {
      setCalendarView(true);
      setToggleText(TABLE_TEXT);
    }
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
      <Row className="option-buttons text-center">
        <Col>
          <Button
            id="view-transactions-btn"
            variant="secondary"
            onClick={toggleTransactions}
            disabled={!transactions}
          >
            {toggleText}
          </Button>
        </Col>
        <Col>
          <Button
            id="add-transaction-btn"
            variant="primary"
            onClick={addTransaction}
            disabled={!transactions}
          >
            Add Transaction
          </Button>
        </Col>
      </Row>

      {transactions ? (
        <>
          <Row className="d-flex">
            <Col className="col-12 col-xl-10 mx-auto">
              {calendarView ? (
                <TransactionsCalendar dateInfo={dateInfo} />
              ) : (
                <TransactionsTable dateInfo={dateInfo} />
              )}
            </Col>
          </Row>
        </>
      ) : (
        <ErrorTransactionsTable />
      )}

      {addTransactionClicked && (
        <AddTransactionModal {...addTransactionModalProps} />
      )}
    </>
  );
};

export default TransactionsLayout;
