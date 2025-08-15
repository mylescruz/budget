import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Row,
  Table,
} from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import { useContext, useEffect, useRef, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import TransactionsTableRow from "./transactionsTableRow";
import aToZDateSorter from "@/helpers/aToZDateSorter";
import zToADateSorter from "@/helpers/ztoADateSorter";
import styles from "@/styles/budget/transactions/transactionsTable.module.css";

const TransactionsTable = ({ monthInfo }) => {
  const { transactions } = useContext(TransactionsContext);
  const [sortedTransactions, setSortedTransactions] = useState(transactions);
  const [transactionCategories, setTransactionCategories] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState("All");
  const [sortDirection, setSortDirection] = useState(true);
  const sortAscending = useRef(true);

  // Gets all the transaction categories in a set
  useEffect(() => {
    if (transactions) {
      const categories = new Set(
        transactions.map((transaction) => transaction.category)
      );

      setTransactionCategories([...categories]);
    }
  }, [transactions]);

  // Filters transactions based on category
  useEffect(() => {
    if (transactionFilter !== "All") {
      const filteredTransactions = transactions.filter(
        (transaction) => transaction.category === transactionFilter
      );

      setSortedTransactions(filteredTransactions);
    } else {
      setSortedTransactions(transactions);
    }
  }, [transactionFilter, transactions]);

  const sortTransactionDates = () => {
    sortAscending.current = !sortAscending.current;

    if (sortAscending.current) {
      setSortedTransactions(aToZDateSorter(transactions));
    } else {
      setSortedTransactions(zToADateSorter(transactions));
    }

    setSortDirection(sortAscending.current);
  };

  const filterTransaction = (categoryName) => {
    setTransactionFilter(categoryName);
  };

  return (
    <Table striped>
      <thead className="table-dark">
        <tr className="d-flex">
          <th
            className={`col-3 col-md-2 col-lg-1 ${styles.dateSorter}`}
            onClick={sortTransactionDates}
          >
            Date
            {sortDirection ? <span> &#8595;</span> : <span> &#8593;</span>}
          </th>
          <th className="col-6 col-md-5 col-lg-4">
            Store
            <PopUp
              title="Click a transaction to view its details."
              id="transactions-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="d-none d-lg-block col-lg-4">Items</th>
          <th className="d-none d-md-block col-md-3 col-lg-2">
            <Row className="d-flex">
              <Col className="col-6">Category</Col>
              <Col className="col-6">
                <Dropdown>
                  <Dropdown.Toggle variant="dark" className="btn-sm" />
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => {
                        filterTransaction("All");
                      }}
                    >
                      All Categories
                    </DropdownItem>
                    {transactionCategories.map((category) => (
                      <DropdownItem
                        key={category}
                        onClick={() => {
                          filterTransaction(category);
                        }}
                      >
                        {category}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </Col>
            </Row>
          </th>
          <th className="col-3 col-md-2 col-lg-1">Amount</th>
        </tr>
      </thead>
      <tbody>
        {sortedTransactions.map((transaction) => (
          <TransactionsTableRow
            key={transaction.id}
            transaction={transaction}
            monthInfo={monthInfo}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default TransactionsTable;
