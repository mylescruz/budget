import useBudgetMonths from "@/hooks/useBudgetMonths";
import { Button, Col, Dropdown, Row } from "react-bootstrap";
import LoadingIndicator from "./loadingIndicator";
import ErrorMessage from "./errorMessage";
import { useMemo } from "react";
import styles from "@/styles/ui/budgetMonthSwitcher.module.css";

const BudgetYearSwitcher = ({ year, setYear, pageInfo, children }) => {
  const { budgetMonths, budgetMonthsRequest } = useBudgetMonths();

  const previousYear = () => {
    setYear((prev) => prev - 1);
  };

  const nextYear = () => {
    setYear((prev) => prev + 1);
  };

  const chooseYear = (yr) => {
    setYear(yr);
  };

  const budgetYears = useMemo(() => {
    if (!budgetMonths) {
      return null;
    }

    const years = new Set(budgetMonths.months.map((month) => month.year));

    return [...years];
  }, [budgetMonths]);

  if (
    budgetMonthsRequest.action === "get" &&
    budgetMonthsRequest.status === "loading"
  ) {
    return <LoadingIndicator />;
  } else {
    return (
      <div className="mx-auto">
        {budgetMonths ? (
          <Row className="d-flex col-12 col-md-8 col-lg-6 col-xl-5 justify-items-between mx-auto align-items-center text-center">
            <Col xs={2} lg={1}>
              {year !== budgetMonths.min.year && (
                <i
                  className="bi bi-chevron-left clicker"
                  onClick={previousYear}
                />
              )}
            </Col>
            <Col xs={8} lg={10} className="px-0">
              <div className="d-flex justify-content-center align-items-center">
                <h1 className={styles.title}>
                  {year} {pageInfo.title}
                </h1>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="light"
                    className="border-0 bg-transparent"
                  />
                  <Dropdown.Menu className={styles.menu}>
                    {budgetYears.map((yr) => (
                      <div key={yr}>
                        <Dropdown.Item
                          className={yr === year ? "bg-primary text-white" : ""}
                          onClick={() => chooseYear(yr)}
                        >
                          {yr}
                        </Dropdown.Item>
                      </div>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
            <Col xs={2} lg={1}>
              {year !== budgetMonths.max.year && (
                <i className="bi bi-chevron-right clicker" onClick={nextYear} />
              )}
            </Col>
          </Row>
        ) : (
          <div className="text-center">
            <h1 className="p-0 m-0 fw-bold">
              {year} {pageInfo.title}
            </h1>
            <ErrorMessage message={budgetMonthsRequest.message} />
          </div>
        )}
        <p className="my-2 mx-4 text-center">{pageInfo.description}</p>

        <div>{children}</div>
      </div>
    );
  }
};

export default BudgetYearSwitcher;
