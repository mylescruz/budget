import useBudgetMonths from "@/hooks/useBudgetMonths";
import { Button, Col, Row } from "react-bootstrap";
import LoadingIndicator from "./loadingIndicator";

const BudgetYearSwitcher = ({ year, setYear, pageInfo, children }) => {
  const { budgetMonths, budgetMonthsLoading } = useBudgetMonths();

  const previousYear = () => {
    setYear((prev) => prev - 1);
  };

  const nextYear = () => {
    setYear((prev) => prev + 1);
  };

  if (budgetMonthsLoading) {
    return <LoadingIndicator />;
  } else if (!budgetMonths) {
    return (
      <Row className="mt-4 text-center">
        <p className="fw-bold text-danger">
          &#9432; There was an error loading your budget months. Please try
          again later!
        </p>
      </Row>
    );
  } else {
    return (
      <div className="mx-auto">
        <Row className="d-flex col-12 col-md-8 col-lg-6 col-xl-5 justify-items-between mx-auto align-items-center text-center">
          <Col className="col-2">
            <Button
              onClick={previousYear}
              size="sm"
              className="btn-dark fw-bold"
              disabled={year === budgetMonths.min.year}
            >
              &#60;
            </Button>
          </Col>
          <Col className="col-8">
            <h1 className="p-0 m-0 fw-bold">
              {year} {pageInfo.title}
            </h1>
          </Col>
          <Col className="col-2">
            <Button
              onClick={nextYear}
              size="sm"
              className="btn-dark fw-bold"
              disabled={year === budgetMonths.max.year}
            >
              &#62;
            </Button>
          </Col>
        </Row>
        <p className="my-2 mx-4 text-center">{pageInfo.description}</p>

        <div>{children}</div>
      </div>
    );
  }
};

export default BudgetYearSwitcher;
