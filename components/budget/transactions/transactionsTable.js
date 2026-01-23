import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Row,
  Table,
} from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import { useContext, useMemo, useState } from "react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import TransactionsTableRow from "./transactionsTableRow";
import ascendingDateSorter from "@/helpers/ascendingDateSorter";
import descendingDateSorter from "@/helpers/descendingDateSorter";
import styles from "@/styles/budget/transactions/transactionsTable.module.css";
import { CategoriesContext } from "@/contexts/CategoriesContext";

const TransactionsTable = ({ dateInfo }) => {
  const { categories } = useContext(CategoriesContext);
  const { transactions } = useContext(TransactionsContext);
  const [transactionFilter, setTransactionFilter] = useState({ name: "All" });
  const [sortDirection, setSortDirection] = useState("asc");

  // Create an array of all non-fixed categories and their subcategories to use as a map
  const changingCategories = useMemo(() => {
    const cats = [];

    cats.push({ name: "All" });

    categories.forEach((category) => {
      if (!category.fixed) {
        if (category.subcategories.length > 0) {
          cats.push({
            name: category.name,
            subcategories: category.subcategories.map(
              (subcategory) => subcategory.name,
            ),
          });

          category.subcategories.forEach((subcategory) => {
            cats.push({
              name: subcategory.name,
            });
          });
        } else {
          cats.push({ name: category.name });
        }
      }
    });

    return cats;
  }, [categories]);

  // Get all the used category names from the user's transactions
  const usedCategories = useMemo(() => {
    return new Set(transactions.map((transaction) => transaction.category));
  }, [transactions]);

  // Create a list of all used categories that can be filtered for in the transactions table
  const transactionCategories = useMemo(() => {
    const filteredCategories = [];

    categories.forEach((category) => {
      if (category.fixed) {
        return;
      }

      const usedSubcategories = category.subcategories
        .map((subcategory) => subcategory.name)
        .filter((name) => usedCategories.has(name));

      const usedParent = usedCategories.has(category.name);

      if (usedParent || usedSubcategories.length > 0) {
        filteredCategories.push({
          name: category.name,
          subcategories: usedSubcategories,
        });

        usedSubcategories.forEach((subcategory) => {
          filteredCategories.push({
            name: subcategory,
            isSubcategory: true,
          });
        });
      }
    });

    return filteredCategories;
  }, [categories, usedCategories]);

  // Filter the transactions based on the chosen category from the dropdown
  const filteredTransactions = useMemo(() => {
    if (!transactions) {
      return [];
    }

    if (transactionFilter.name === "All") {
      return transactions;
    }

    const selectedCategories = transactionFilter.subcategories ?? [
      transactionFilter.name,
    ];

    return transactions.filter((transaction) =>
      selectedCategories.includes(transaction.category),
    );
  }, [transactions, transactionFilter]);

  // Sorts the transaction table based on the user's choice on the date column
  const sortedTransactions = useMemo(() => {
    if (sortDirection === "asc") {
      return ascendingDateSorter(filteredTransactions);
    } else {
      return descendingDateSorter(filteredTransactions);
    }
  }, [filteredTransactions, sortDirection]);

  const sortTransactionDates = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Set the filter to the chosen category based on the changing categories map
  const filterTransaction = (category) => {
    setTransactionFilter(
      changingCategories.find(
        (changeCategory) => category.name === changeCategory.name,
      ),
    );
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
            {sortDirection === "asc" ? (
              <span> &#8595;</span>
            ) : (
              <span> &#8593;</span>
            )}
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
                  <DropdownMenu className={styles.filterMenu}>
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
