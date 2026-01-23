import { useEffect, useMemo, useState } from "react";
import { Button, Col, Dropdown, Form, Row } from "react-bootstrap";
import TransactionsSummaryTable from "./transactionsSummaryTable";
import styles from "@/styles/summary/transactionsSummary/transactionsSummaryLayout.module.css";
import ascendingDateSorter from "@/helpers/ascendingDateSorter";
import descendingDateSorter from "@/helpers/descendingDateSorter";
import stringSorter from "@/helpers/stringSorter";
import dollarSorter from "@/helpers/dollarSorter";

const transactionsPerPage = 25;

const allCategories = { id: "All", name: "All Categories" };

const sortOptions = [
  "Date (Asc)",
  "Date (Desc)",
  "Store (Asc)",
  "Store (Desc)",
  "Category (Asc)",
  "Category (Desc)",
  "Amount (Asc)",
  "Amount (Desc)",
];

const TransactionsSummaryLayout = ({ transactions, categories }) => {
  const [categoryFilter, setCategoryFilter] = useState(allCategories);
  const [sortOption, setSortOption] = useState("Date (Asc)");
  const [searchFilter, setSearchFilter] = useState("");
  const [page, setPage] = useState(1);

  // Reset the page if the user changes the category or search filter
  useEffect(() => {
    setPage(1);
  }, [categoryFilter, searchFilter]);

  const categoriesFilters = useMemo(() => {
    const filteredCategories = [{ ...allCategories }];

    categories.forEach((category) => {
      if (!category.fixed) {
        if (category.subcategories.length !== 0) {
          filteredCategories.push({
            id: category._id,
            name: category.name,
            subcategories: category.subcategories.map(
              (subcategory) => subcategory.name,
            ),
          });

          category.subcategories.forEach((subcategory) => {
            filteredCategories.push({
              id: subcategory.id,
              name: subcategory.name,
              isSubcategory: true,
            });
          });
        } else {
          filteredCategories.push({
            id: category._id,
            name: category.name,
          });
        }
      }
    });

    return filteredCategories;
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    if (categoryFilter.name === "All Categories") {
      return transactions;
    }

    const selectedCategories = categoryFilter.subcategories ?? [
      categoryFilter.name,
    ];

    return transactions.filter((transaction) =>
      selectedCategories.includes(transaction.category),
    );
  }, [categoryFilter, transactions]);

  const searchedTransactions = useMemo(() => {
    if (searchFilter === "") {
      return filteredTransactions;
    }

    return filteredTransactions.filter((transaction) => {
      return (
        transaction.store.toLowerCase().includes(searchFilter.toLowerCase()) ||
        transaction.items.toLowerCase().includes(searchFilter.toLowerCase())
      );
    });
  }, [searchFilter, filteredTransactions]);

  const sortedTransactions = useMemo(() => {
    let transactionsSorted;

    switch (sortOption) {
      case "Date (Asc)":
        transactionsSorted = ascendingDateSorter(searchedTransactions);
        break;
      case "Date (Desc)":
        transactionsSorted = descendingDateSorter(searchedTransactions);
        break;
      case "Store (Asc)":
        transactionsSorted = stringSorter(searchedTransactions, "store", "asc");
        break;
      case "Store (Desc)":
        transactionsSorted = stringSorter(
          searchedTransactions,
          "store",
          "desc",
        );
        break;
      case "Category (Asc)":
        transactionsSorted = stringSorter(
          searchedTransactions,
          "category",
          "asc",
        );
        break;
      case "Category (Desc)":
        transactionsSorted = stringSorter(
          searchedTransactions,
          "category",
          "desc",
        );
        break;
      case "Amount (Asc)":
        transactionsSorted = dollarSorter(
          searchedTransactions,
          "amount",
          "asc",
        );
        break;
      case "Amount (Desc)":
        transactionsSorted = dollarSorter(
          searchedTransactions,
          "amount",
          "desc",
        );
        break;
      default:
        transactionsSorted = ascendingDateSorter(searchedTransactions);
    }

    return transactionsSorted.slice(
      page * transactionsPerPage - transactionsPerPage,
      page * transactionsPerPage,
    );
  }, [searchedTransactions, sortOption, page]);

  const totalPages = Math.ceil(
    searchedTransactions.length / transactionsPerPage,
  );

  const handleInput = (e) => {
    setSearchFilter(e.target.value);
  };

  const previousPage = () => {
    setPage(page - 1);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
        <div className="w-100 mx-2">
          <Form.Group controlId="searchFilter">
            <Form.Control
              type="text"
              value={searchFilter}
              placeholder="Search for a transaction"
              onChange={handleInput}
            />
          </Form.Group>
        </div>
        <div className="text-end">
          <Dropdown className="mx-2">
            <Dropdown.Toggle variant="dark">Filter</Dropdown.Toggle>
            <Dropdown.Menu className={styles.filterMenu}>
              {categoriesFilters.map((category) => (
                <Dropdown.Item
                  key={category.id}
                  onClick={() => {
                    setCategoryFilter(category);
                  }}
                >
                  <span className={category.isSubcategory ? "mx-2" : "fw-bold"}>
                    {category.name}
                  </span>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="text-end">
          <Dropdown>
            <Dropdown.Toggle variant="dark">Sort</Dropdown.Toggle>
            <Dropdown.Menu className={styles.filterMenu}>
              {sortOptions.map((option) => (
                <Dropdown.Item
                  key={option}
                  onClick={() => {
                    setSortOption(option);
                  }}
                >
                  {option}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <TransactionsSummaryTable sortedTransactions={sortedTransactions} />

      {sortedTransactions.length !== 0 && (
        <Row className="d-flex col-12 col-md-6 col-lg-4 justify-items-between mx-auto align-items-center text-center">
          <Col className="col-3">
            <Button
              onClick={previousPage}
              size="sm"
              className="btn-dark fw-bold"
              disabled={page === 1 || page === 0}
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
      )}
    </>
  );
};

export default TransactionsSummaryLayout;
