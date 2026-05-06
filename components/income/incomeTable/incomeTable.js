import { INCOME_TYPES } from "@/lib/constants/income";
import { useEffect, useMemo, useState } from "react";
import IncomePagination from "./incomePagination";
import styles from "@/styles/income/incomeTable.module.css";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";

const SOURCES_PER_PAGE = 20;

const IncomeTable = ({ income, setChosenSource, setModal }) => {
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

  const formattedIncome = income.map((src) => {
    const formatted = {
      _id: src._id,
      type: src.incomeType,
      date: src.date,
      source: src.source,
      description: src.description,
      amount: src.amount,
      createdTS: src.createdTS,
    };

    if (src.incomeType === INCOME_TYPES.PAYCHECK) {
      formatted.gross = src.gross;
      formatted.deductions = src.deductions;
    }

    return formatted;
  });

  // Filters the array based on the searched input
  const searchedIncome = useMemo(() => {
    if (searchInput === "") {
      return formattedIncome;
    }

    return formattedIncome.filter(
      (src) =>
        src.source.toLowerCase().includes(searchInput.toLowerCase()) ||
        src.description.toLowerCase().includes(searchInput.toLowerCase()) ||
        src.type.toLowerCase().includes(searchInput.toLowerCase()) ||
        src.amount.toString().includes(searchInput.toLowerCase()),
    );
  }, [searchInput, formattedIncome]);

  // Paginate the income sorted by date
  const displayedIncome = useMemo(() => {
    return searchedIncome
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
          case "source":
            if (sort.asc) {
              return a.source.localeCompare(b.source);
            } else {
              return b.source.localeCompare(a.source);
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
        page * SOURCES_PER_PAGE - SOURCES_PER_PAGE,
        page * SOURCES_PER_PAGE,
      );
  }, [searchedIncome, sort, page]);

  // Get the total pages for the array after the search and filter options to display for pagination
  const totalPages = Math.ceil(searchedIncome.length / SOURCES_PER_PAGE);

  const openIncomeDetails = (sourceId) => {
    const foundSource = income.find((source) => source._id === sourceId);

    setChosenSource({ ...foundSource, new: false });

    setModal("incomeDetails");
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
            <h5 className="mb-0">Income</h5>
            <Button size="sm" onClick={() => setModal("addIncome")}>
              + Add
            </Button>
          </div>

          <div className="mb-2">
            <Form.Group controlId="searchInput">
              <Form.Control
                type="text"
                value={searchInput}
                placeholder="Search through your income"
                onChange={handleSearch}
              />
            </Form.Group>
          </div>

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
              onClick={() => handleSort("source")}
            >
              Source{" "}
              {sort.field === "source" && (
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
              Type{" "}
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
            {displayedIncome.length === 0 ? (
              <div className="py-4 text-center text-muted small">
                There are no results that match these filters
              </div>
            ) : (
              displayedIncome.map((src) => (
                <Row
                  key={src._id}
                  className={`d-flex flex-row py-1 my-1 ${styles.incomeRow}`}
                  onClick={() => openIncomeDetails(src._id)}
                >
                  <Col xs={3} md={2} lg={1} className="px-2">
                    {dateFormatter(src.date)}
                  </Col>
                  <Col xs={5} md={5} lg={6} className="px-2">
                    <div>
                      <div className="fw-semibold">{src.source}</div>
                      <div className="text-muted small d-none d-md-flex">
                        {src.description.length > 60
                          ? src.description.slice(0, 60) + "..."
                          : src.description}
                      </div>
                    </div>
                  </Col>
                  <Col
                    xs={0}
                    md={3}
                    lg={3}
                    className="d-none d-md-flex align-items-start px-2"
                  >
                    <div className="fw-semibold">{src.type}</div>
                  </Col>
                  <Col xs={4} md={2} lg={2} className="px-2 text-end">
                    <div className="text-end fw-semibold">
                      {dollarFormatter(src.amount)}
                    </div>
                  </Col>
                </Row>
              ))
            )}
          </div>
          {displayedIncome.length !== 0 && (
            <IncomePagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default IncomeTable;
