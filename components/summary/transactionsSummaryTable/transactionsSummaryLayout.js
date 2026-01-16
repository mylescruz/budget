import { useMemo, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import TransactionsSummaryTable from "./transactionsSummaryTable";

const transactionsPerPage = 25;

const TransactionsSummaryLayout = ({ transactions }) => {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const filteredTransactions = useMemo(() => {
    if (categoryFilter === "All") {
      return transactions;
    } else {
      return transactions.filter(
        (transaction) => transaction.category === categoryFilter
      );
    }
  }, [categoryFilter]);

  const sortedTransactions = useMemo(() => {
    setTotalPages(Math.ceil(filteredTransactions.length / transactionsPerPage));

    return filteredTransactions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(
        page * transactionsPerPage - transactionsPerPage,
        page * transactionsPerPage
      );
  }, [filteredTransactions, page]);

  const previousPage = () => {
    setPage(page - 1);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  return (
    <>
      <TransactionsSummaryTable sortedTransactions={sortedTransactions} />

      <Row className="d-flex col-12 col-md-6 col-lg-4 justify-items-between mx-auto align-items-center text-center">
        <Col className="col-3">
          <Button
            onClick={previousPage}
            size="sm"
            className="btn-dark fw-bold"
            disabled={page === 1}
          >
            &#60;
          </Button>
        </Col>
        <Col className="col-6">
          <h4 className="p-0 m-0 fw-bold">
            {page}/{totalPages}
          </h4>
        </Col>
        <Col className="col-3">
          <Button
            onClick={nextPage}
            size="sm"
            className="btn-dark fw-bold"
            disabled={page === totalPages}
          >
            &#62;
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default TransactionsSummaryLayout;
