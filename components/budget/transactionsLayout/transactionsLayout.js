import { BudgetContext } from "@/contexts/BudgetContext";
import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import { useContext, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import TransactionDetailsModal from "./transactionDetailsModal/transactionDetailsModal";
import AddTransactionsModal from "./addTransactionsModal/addTransactionsModal";
import EditTransactionModal from "./editTransactionsModal/editTransactionModal";
import DeleteTransactionModal from "./deleteTransactionModal";

const TransactionsLayout = ({ dateInfo }) => {
  const { transactions } = useContext(BudgetContext);

  const [modal, setModal] = useState(null);
  const [chosenTransaction, setChosenTransaction] = useState(null);

  const openDetailsModal = (transaction) => {
    setChosenTransaction({
      ...transaction,
      oldCategory: transaction.category,
      oldAmount: transaction.amount,
    });

    setModal("DETAILS");
  };

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Transactions</h5>
            <Button size="sm" onClick={() => setModal("ADD")}>
              + Add
            </Button>
          </div>

          <Row className="d-flex flex-row text-muted small">
            <Col xs={3} md={2} lg={1} className="px-2">
              Date
            </Col>
            <Col xs={5} md={5} lg={6} className="px-2">
              Merchant
            </Col>
            <Col xs={0} md={3} lg={3} className="d-none d-md-flex px-2">
              Category
            </Col>
            <Col xs={4} md={2} lg={2} className="px-2 text-end">
              Amount
            </Col>
          </Row>

          <div className="d-flex flex-column w-100">
            {transactions
              .filter(
                (transaction) => transaction.type === TRANSACTION_TYPES.EXPENSE,
              )
              .map((transaction) => (
                <Row
                  key={transaction._id}
                  className="d-flex flex-row my-2"
                  onClick={() => openDetailsModal(transaction)}
                >
                  <Col xs={3} md={2} lg={1} className="px-2">
                    {dateFormatter(transaction.date)}
                  </Col>
                  <Col xs={5} md={5} lg={6} className="px-2">
                    <div>
                      <div className="fw-semibold">{transaction.store}</div>
                      <div className="text-muted small d-none d-md-flex">
                        {transaction.items.length > 60
                          ? transaction.items.slice(0, 60) + "..."
                          : transaction.items}
                      </div>
                    </div>
                  </Col>
                  <Col
                    xs={0}
                    md={3}
                    lg={3}
                    className="d-none d-md-flex align-items-start px-2"
                  >
                    <div className="d-flex flex-row align-items-center">
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: transaction.color,
                        }}
                      />

                      <div className="fw-semibold mx-2 my-0">
                        {transaction.category}
                      </div>
                    </div>
                  </Col>
                  <Col xs={4} md={2} lg={2} className="px-2 text-end">
                    <div
                      className={`text-end fw-semibold ${transaction.amount < 0 ? "text-success" : "text-dark"}`}
                    >
                      {dollarFormatter(transaction.amount)}
                    </div>
                  </Col>
                </Row>
              ))}
          </div>
        </Card.Body>
      </Card>

      {modal === "DETAILS" && (
        <TransactionDetailsModal
          chosenTransaction={chosenTransaction}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "ADD" && (
        <AddTransactionsModal
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "EDIT" && (
        <EditTransactionModal
          chosenTransaction={chosenTransaction}
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "DELETE" && (
        <DeleteTransactionModal
          chosenTransaction={chosenTransaction}
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}
    </>
  );
};

export default TransactionsLayout;
