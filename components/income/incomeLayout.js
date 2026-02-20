import { Button, Col, Container, Dropdown, Form, Row } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import LoadingIndicator from "../layout/loadingIndicator";
import useIncome from "@/hooks/useIncome";
import AddIncomeModal from "./addIncomeModal";
import IncomeTable from "./incomeTable/incomeTable";
import ascendingDateSorter from "@/helpers/ascendingDateSorter";
import descendingDateSorter from "@/helpers/descendingDateSorter";
import stringSorter from "@/helpers/stringSorter";
import dollarSorter from "@/helpers/dollarSorter";
import styles from "@/styles/income/incomeLayout.module.css";
import IncomeTotalsLayout from "./incomeTotalsLayout";
import BudgetYearSwitcher from "../layout/budgetYearSwitcher";

const sourcesPerPage = 20;

const sortOptions = [
  "Date (Desc)",
  "Date (Asc)",
  "Source (Asc)",
  "Source (Desc)",
  "Type (Asc)",
  "Type (Desc)",
  "Amount (Asc)",
  "Amount (Desc)",
];

const allTypes = "All";

const InnerIncomeLayout = ({ year }) => {
  const {
    income,
    incomeLoading,
    postIncome,
    putIncome,
    deleteIncome,
    incomeTotals,
  } = useIncome(year);

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [typeFilter, setTypeFilter] = useState(allTypes);
  const [sortOption, setSortOption] = useState(sortOptions[0]);
  const [searchFilter, setSearchFilter] = useState("");
  const [page, setPage] = useState(1);

  // Reset the results if the type or search filter changes
  useEffect(() => {
    setPage(1);
  }, [typeFilter, searchFilter]);

  const incomeFilters = useMemo(() => {
    setTypeFilter(allTypes);

    const filteredIncome = ["All"];

    income.forEach((source) => {
      if (!filteredIncome.includes(source.type)) {
        filteredIncome.push(source.type);
      }
    });

    return filteredIncome;
  }, [income]);

  const filteredIncome = useMemo(() => {
    if (typeFilter === "All") {
      return income;
    }

    return income.filter((source) => source.type === typeFilter);
  }, [typeFilter, income]);

  const searchedIncome = useMemo(() => {
    if (searchFilter === "") {
      return filteredIncome;
    }

    return filteredIncome.filter((source) => {
      return (
        source.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        source.description.toLowerCase().includes(searchFilter.toLowerCase())
      );
    });
  }, [searchFilter, filteredIncome]);

  const sortedIncome = useMemo(() => {
    let incomeSorted;

    switch (sortOption) {
      case "Date (Asc)":
        incomeSorted = ascendingDateSorter(searchedIncome);
        break;
      case "Date (Desc)":
        incomeSorted = descendingDateSorter(searchedIncome);
        break;
      case "Source (Asc)":
        incomeSorted = stringSorter(searchedIncome, "name", "asc");
        break;
      case "Source (Desc)":
        incomeSorted = stringSorter(searchedIncome, "name", "desc");
        break;
      case "Type (Asc)":
        incomeSorted = stringSorter(searchedIncome, "type", "asc");
        break;
      case "Type (Desc)":
        incomeSorted = stringSorter(searchedIncome, "type", "desc");
        break;
      case "Amount (Asc)":
        incomeSorted = dollarSorter(searchedIncome, "amount", "asc");
        break;
      case "Amount (Desc)":
        incomeSorted = dollarSorter(searchedIncome, "amount", "desc");
        break;
      default:
        incomeSorted = ascendingDateSorter(searchedIncome);
    }

    return incomeSorted.slice(
      page * sourcesPerPage - sourcesPerPage,
      page * sourcesPerPage,
    );
  }, [searchedIncome, sortOption, page]);

  const totalPages = Math.ceil(searchedIncome.length / sourcesPerPage);

  const handleInput = (e) => {
    setSearchFilter(e.target.value);
  };

  const previousPage = () => {
    setPage(page - 1);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  const openAddIncomeModal = () => {
    setShowAddIncome(true);
  };

  const AddIncomeModalProps = {
    year: year,
    postIncome: postIncome,
    showAddIncome: showAddIncome,
    setShowAddIncome: setShowAddIncome,
  };

  if (incomeLoading) {
    return <LoadingIndicator />;
  } else if (!income) {
    return (
      <div className="text-danger fw-bold text-center">
        &#9432; There was an error loading your income. Please try again later!
      </div>
    );
  } else {
    return (
      <Container>
        <IncomeTotalsLayout incomeTotals={incomeTotals} />

        <Container className="text-center mt-2">
          <Button variant="primary" onClick={openAddIncomeModal}>
            Add Income
          </Button>
        </Container>

        {income.length === 0 ? (
          <div className="mt-4 fw-bold text-center">
            &#9432; You don't have any income yet! Enter a new source above.
          </div>
        ) : (
          <div className="d-flex flex-column mt-4">
            <Row className="d-flex align-items-center col-12 col-lg-10 mt-2 mb-4 mx-auto">
              <Col className="col-6 col-md-8 col-xl-10">
                <Form.Group controlId="searchFilter">
                  <Form.Control
                    type="text"
                    value={searchFilter}
                    placeholder="Search for income"
                    onChange={handleInput}
                  />
                </Form.Group>
              </Col>
              <Col className="col-3 col-md-2 col-xl-1 text-start text-md-end">
                <Dropdown>
                  <Dropdown.Toggle variant="dark">Filter</Dropdown.Toggle>
                  <Dropdown.Menu>
                    {incomeFilters.map((type) => (
                      <Dropdown.Item
                        key={type}
                        className={
                          typeFilter === type ? "bg-primary text-white" : ""
                        }
                        onClick={() => {
                          setTypeFilter(type);
                        }}
                      >
                        {type}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col className="col-3 col-md-2 col-xl-1 text-end">
                <Dropdown>
                  <Dropdown.Toggle variant="dark">Sort</Dropdown.Toggle>
                  <Dropdown.Menu className={styles.sortMenu}>
                    {sortOptions.map((option) => (
                      <Dropdown.Item
                        key={option}
                        className={
                          sortOption === option ? "bg-primary text-white" : ""
                        }
                        onClick={() => {
                          setSortOption(option);
                        }}
                      >
                        {option}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>

            <Row className="d-flex mb-4">
              <Col className="mx-auto col-12 col-lg-10">
                <IncomeTable
                  sortedIncome={sortedIncome}
                  year={year}
                  putIncome={putIncome}
                  deleteIncome={deleteIncome}
                  incomeTotals={incomeTotals}
                />
              </Col>
            </Row>

            {sortedIncome.length !== 0 && (
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
          </div>
        )}

        <AddIncomeModal {...AddIncomeModalProps} />
      </Container>
    );
  }
};

const IncomeLayout = ({ dateInfo }) => {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());

  const pageInfo = {
    title: "Income",
    description: "View and add all your income for the current year.",
  };

  return (
    <BudgetYearSwitcher year={year} setYear={setYear} pageInfo={pageInfo}>
      <InnerIncomeLayout year={year} />
    </BudgetYearSwitcher>
  );
};

export default IncomeLayout;
