import { useMemo, useState } from "react";
import { Button, Col, Dropdown, Form, Row } from "react-bootstrap";
import TransactionsSummaryTable from "./transactionsSummaryTable";
import styles from "@/styles/summary/transactionsSummary/transactionsSummaryLayout.module.css";

const transactionsPerPage = 25;

const allCategories = { id: "All", name: "All Categories" };

const TransactionsSummaryLayout = ({ transactions, categories }) => {
  const [categoryFilter, setCategoryFilter] = useState(allCategories);
  const [searchFilter, setSearchFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categoriesFilters = useMemo(() => {
    const filteredCategories = [{ ...allCategories }];

    categories.forEach((category) => {
      if (!category.fixed) {
        filteredCategories.push({
          id: category._id,
          name: category.name,
          subcategories: category.subcategories.map(
            (subcategory) => subcategory.name
          ),
        });

        category.subcategories.forEach((subcategory) => {
          filteredCategories.push({
            id: subcategory.id,
            name: subcategory.name,
            isSubcategory: true,
          });
        });
      }
    });

    return filteredCategories;
  }, [categories]);

  const searchedTransactions = useMemo(() => {
    if (searchFilter === "") {
      return transactions;
    } else {
      return transactions.filter((transaction) => {
        if (
          transaction.store.toLowerCase().includes(searchFilter) ||
          transaction.items.toLowerCase().includes(searchFilter)
        ) {
          return transaction;
        }
      });
    }
  }, [searchFilter]);

  const filteredTransactions = useMemo(() => {
    if (categoryFilter.name === "All Categories") {
      return searchedTransactions;
    } else {
      const selectedCategories =
        categoryFilter.subcategories.length !== 0
          ? categoryFilter.subcategories
          : [categoryFilter.name];

      return searchedTransactions.filter((transaction) =>
        selectedCategories.includes(transaction.category)
      );
    }
  }, [searchedTransactions, categoryFilter]);

  const sortedTransactions = useMemo(() => {
    setTotalPages(Math.ceil(filteredTransactions.length / transactionsPerPage));

    return filteredTransactions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(
        page * transactionsPerPage - transactionsPerPage,
        page * transactionsPerPage
      );
  }, [filteredTransactions, page]);

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
          <Dropdown>
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
      </div>

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
