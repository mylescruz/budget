import { BudgetContext } from "@/contexts/BudgetContext";
import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import TransactionDetailsModal from "./transactionDetailsModal/transactionDetailsModal";
import AddTransactionsModal from "./addTransactionsModal/addTransactionsModal";
import EditTransactionModal from "./editTransactionsModal/editTransactionModal";
import DeleteTransactionModal from "./deleteTransactionModal";
import styles from "@/styles/budget/transactionsLayout/transactionsLayout.module.css";
import TransactionsPagination from "./transactionsPagination";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";

const TRANSACTIONS_PER_PAGE = 20;

const TransactionsLayout = ({ dateInfo }) => {
  const { transactions } = useContext(BudgetContext);

  const [modal, setModal] = useState(null);
  const [chosenTransaction, setChosenTransaction] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState({
    field: "date",
    asc: true,
  });
  const [page, setPage] = useState(1);

  // Reset the results if the type or search filter changes
  useEffect(() => {
    setPage(1);
  }, [searchInput]);

  const formattedTransactions = transactions
    .filter(
      (transaction) =>
        transaction.type === TRANSACTION_TYPES.EXPENSE ||
        transaction.type === TRANSACTION_TYPES.TRANSFER,
    )
    .map((transaction) => {
      const formatted = {
        _id: transaction._id,
        transactionType: transaction.type,
        date: transaction.date,
        amount: transaction.amount,
        createdTS: transaction.createdTS,
      };

      if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
        formatted.name = transaction.store;
        formatted.description = transaction.items;
        formatted.type = transaction.category;
        formatted.color = transaction.color;
      } else {
        formatted.name = `Transfer from ${transaction.fromAccount} to ${transaction.toAccount}`;
        formatted.description = transaction.description;
        formatted.type = TRANSACTION_TYPES.TRANSFER;
      }

      return formatted;
    });

  // Filters the array based on the searched input
  const searchedTransactions = useMemo(() => {
    if (searchInput === "") {
      return formattedTransactions;
    }

    return formattedTransactions.filter(
      (transaction) =>
        // Search by the expense transaction's store or transfer transaction's accounts
        transaction.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        // Search by the expense transaction's items bought or transfer transaction's description
        transaction.description
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        // Search by the expense transaction's category or search for a transfer type transaction
        transaction.type.toLowerCase().includes(searchInput.toLowerCase()) ||
        // Search for the amount of a transaction
        transaction.amount.toString().includes(searchInput.toLowerCase()),
    );
  }, [searchInput, formattedTransactions]);

  // Paginate the transactions sorted by date
  const displayedTransactions = useMemo(() => {
    return searchedTransactions
      .sort((a, b) => {
        switch (sort.field) {
          case "date":
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);

            if (aDate > bDate) {
              if (sort.asc) {
                return 1;
              } else {
                return -1;
              }
            } else if (aDate < bDate) {
              if (sort.asc) {
                return -1;
              } else {
                return 1;
              }
            } else {
              return new Date(a.createdTS) - new Date(b.createdTS);
            }
          case "name":
            if (sort.asc) {
              return a.name.localeCompare(b.name);
            } else {
              return b.name.localeCompare(a.name);
            }
          case "type":
            if (sort.asc) {
              return a.type.localeCompare(b.type);
            } else {
              return b.type.localeCompare(a.type);
            }
          case "amount":
            if (sort.asc) {
              return a.amount - b.amount;
            } else {
              return b.amount - a.amount;
            }
        }
      })
      .slice(
        page * TRANSACTIONS_PER_PAGE - TRANSACTIONS_PER_PAGE,
        page * TRANSACTIONS_PER_PAGE,
      );
  }, [searchedTransactions, sort, page]);

  // Get the total pages for the array after the search and filter options to display for pagination
  const totalPages = Math.ceil(
    searchedTransactions.length / TRANSACTIONS_PER_PAGE,
  );

  // Calculate the total amount of the searched transactions
  const totalAmount = centsToDollars(
    searchedTransactions.reduce(
      (sum, transaction) => sum + dollarsToCents(transaction.amount),
      0,
    ),
  );

  const openDetailsModal = (transactionId) => {
    const foundTransaction = transactions.find(
      (transaction) => transaction._id === transactionId,
    );

    if (foundTransaction.type === TRANSACTION_TYPES.EXPENSE) {
      foundTransaction.oldCategory = foundTransaction.category;
      foundTransaction.oldAmount = foundTransaction.amount;
    }

    setChosenTransaction(foundTransaction);

    setModal("DETAILS");
  };

  // Sort the rows in the table by the column header in ascending or descending order
  const handleSort = (field) => {
    setSort((prev) => ({
      field: field,
      asc: prev.field === field ? !prev.asc : true,
    }));
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
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

          <div className="mb-2">
            <Form.Group controlId="searchInput">
              <Form.Control
                type="text"
                value={searchInput}
                placeholder="Search for a transaction"
                onChange={handleSearch}
              />
            </Form.Group>
          </div>

          {searchedTransactions.length > 0 && searchInput !== "" && (
            <p className="text-muted">
              {searchedTransactions.length} transactions cost{" "}
              {dollarFormatter(totalAmount)}
            </p>
          )}

          <Row className="d-flex flex-row text-muted small">
            <Col
              xs={3}
              md={2}
              lg={1}
              className="px-2 clicker"
              onClick={() => handleSort("date")}
            >
              Date{" "}
              {sort.field === "date" && (
                <i
                  className={`bi ${sort.asc ? "bi-arrow-up" : "bi-arrow-down"}`}
                />
              )}
            </Col>
            <Col
              xs={5}
              md={5}
              lg={6}
              className="px-2 clicker"
              onClick={() => handleSort("name")}
            >
              Merchant{" "}
              {sort.field === "name" && (
                <i
                  className={`bi ${sort.asc ? "bi-arrow-up" : "bi-arrow-down"}`}
                />
              )}
            </Col>
            <Col
              xs={0}
              md={3}
              lg={3}
              className="d-none d-md-flex px-2 clicker"
              onClick={() => handleSort("type")}
            >
              Category{" "}
              {sort.field === "type" && (
                <i
                  className={`bi ${sort.asc ? "bi-arrow-up" : "bi-arrow-down"}`}
                />
              )}
            </Col>
            <Col
              xs={4}
              md={2}
              lg={2}
              className="px-2 text-end clicker"
              onClick={() => handleSort("amount")}
            >
              Amount{" "}
              {sort.field === "amount" && (
                <i
                  className={`bi ${sort.asc ? "bi-arrow-up" : "bi-arrow-down"}`}
                />
              )}
            </Col>
          </Row>

          <div className="d-flex flex-column w-100">
            {displayedTransactions.length === 0 ? (
              <div className="py-4 text-center text-muted small">
                There are no results that match these filters
              </div>
            ) : (
              displayedTransactions.map((transaction) => (
                <Row
                  key={transaction._id}
                  className={`d-flex flex-row py-1 my-1 ${styles.transactionRow}`}
                  onClick={() => openDetailsModal(transaction._id)}
                >
                  <Col xs={3} md={2} lg={1} className="px-2">
                    {dateFormatter(transaction.date)}
                  </Col>
                  <Col xs={5} md={5} lg={6} className="px-2">
                    <div>
                      <div className="fw-semibold">{transaction.name}</div>
                      <div className="text-muted small d-none d-md-flex">
                        {transaction.description.length > 60
                          ? transaction.description.slice(0, 60) + "..."
                          : transaction.description}
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
                      {transaction.color && (
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: transaction.color,
                          }}
                        />
                      )}

                      <div className="fw-semibold mx-2 my-0">
                        {transaction.type}
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
              ))
            )}
          </div>
          {displayedTransactions.length !== 0 && (
            <TransactionsPagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          )}
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
