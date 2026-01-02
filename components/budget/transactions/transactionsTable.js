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
import ascendingDateSorter from "@/helpers/ascendingDateSorter";
import descendingDateSorter from "@/helpers/descendingDateSorter";
import styles from "@/styles/budget/transactions/transactionsTable.module.css";
import { CategoriesContext } from "@/contexts/CategoriesContext";

const TransactionsTable = ({ dateInfo }) => {
  const { categories } = useContext(CategoriesContext);
  const { transactions } = useContext(TransactionsContext);
  const [sortedTransactions, setSortedTransactions] = useState(transactions);
  const [transactionCategories, setTransactionCategories] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState({ name: "All" });
  const [sortDirection, setSortDirection] = useState(true);
  const sortAscending = useRef(true);

  // Gets all the transaction categories in a set
  useEffect(() => {
    if (categories && transactions) {
      const transactionsWithCategories = new Array(
        new Set(transactions.map((transaction) => transaction.category))
      );

      let filteredCategories = [];

      for (const category of categories) {
        if (!category.fixed) {
          if (category.subcategories.length > 0) {
            const subcategories = category.subcategories.map(
              (subcategory) => subcategory.name
            );

            filteredCategories.push({
              name: category.name,
              subcategories: subcategories,
            });

            for (const subcategory of subcategories) {
              filteredCategories.push({
                name: subcategory,
                isSubcategory: true,
              });
            }
          } else {
            filteredCategories.push({
              name: category.name,
            });
          }
        }
      }

      setTransactionCategories(filteredCategories);
    }
  }, [transactions, categories]);

  // Filters transactions based on category
  useEffect(() => {
    if (transactionFilter.name !== "All") {
      let categoryFilter = [];

      if (transactionFilter.subcategories) {
        for (const subcategory of transactionFilter.subcategories) {
          categoryFilter.push(subcategory);
        }
      } else {
        categoryFilter.push(transactionFilter.name);
      }

      const filteredTransactions = transactions.filter((transaction) =>
        categoryFilter.includes(transaction.category)
      );

      setSortedTransactions(filteredTransactions);
    } else {
      setSortedTransactions(transactions);
    }
  }, [transactionFilter, transactions]);

  const sortTransactionDates = () => {
    sortAscending.current = !sortAscending.current;

    if (sortAscending.current) {
      setSortedTransactions(ascendingDateSorter(transactions));
    } else {
      setSortedTransactions(descendingDateSorter(transactions));
    }

    setSortDirection(sortAscending.current);
  };

  const filterTransaction = (category) => {
    setTransactionFilter(category);
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
                      className="fw-bold"
                      onClick={() => {
                        filterTransaction({ name: "All" });
                      }}
                    >
                      All Categories
                    </DropdownItem>
                    {transactionCategories.map((category) => (
                      <DropdownItem
                        key={category.name}
                        onClick={() => {
                          filterTransaction(category);
                        }}
                      >
                        <span
                          className={
                            category.isSubcategory ? "mx-2" : "fw-bold"
                          }
                        >
                          {category.name}
                        </span>
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
            key={transaction._id}
            transaction={transaction}
            dateInfo={dateInfo}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default TransactionsTable;
