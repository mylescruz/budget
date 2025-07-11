import { Button, Col, Row } from "react-bootstrap";
import TransactionsTable from "./transactionsTable";
import AddTransactionModal from "./addTransactionModal";
import { useContext, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import ErrorTransactionsTable from "./errorTransactionsTable";

const VIEW_TEXT = "View Transactions";
const HIDE_TEXT = "Hide Transactions";

const TransactionsLayout = ({ monthInfo }) => {
  const { transactions } = useContext(TransactionsContext);
  const [viewTransactions, setViewTransactions] = useState(true);
  const [viewText, setViewText] = useState(HIDE_TEXT);
  const [addTransactionClicked, setAddTransactionClicked] = useState(false);

  const toggleTransactions = () => {
    if (viewTransactions) {
      setViewTransactions(false);
      setViewText(VIEW_TEXT);
    } else {
      setViewTransactions(true);
      setViewText(HIDE_TEXT);
    }
  };

  const addTransaction = () => {
    setAddTransactionClicked(true);
  };

  const addTransactionModalProps = {
    monthInfo: monthInfo,
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
            {viewText}
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
          {viewTransactions && (
            <Row className="d-flex">
              <Col className="col-12 col-xl-10 mx-auto">
                <TransactionsTable monthInfo={monthInfo} />
              </Col>
            </Row>
          )}
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
