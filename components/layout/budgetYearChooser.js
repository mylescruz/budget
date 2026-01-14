import useBudgetYears from "@/hooks/useBudgetYears";
import { useEffect } from "react";
import { Button, Col, Row } from "react-bootstrap";

const BudgetYearChooser = ({ year, setYear }) => {
  const { budgetYears, budgetYearsLoading } = useBudgetYears();

  // Set the current year
  useEffect(() => {
    if (!budgetYearsLoading && budgetYears) {
      setYear(budgetYears.current);
    }
  }, [budgetYears, budgetYearsLoading, setYear]);

  const nextYear = () => {
    setYear(year + 1);
  };

  const previousYear = () => {
    setYear(year - 1);
  };

  return (
    <Row className="d-flex col-12 col-md-6 col-lg-4 justify-items-between mx-auto align-items-center text-center">
      <Col className="col-3">
        <Button
          onClick={previousYear}
          size="sm"
          className="btn-dark fw-bold"
          disabled={year === budgetYears.min || budgetYearsLoading}
        >
          &#60;
        </Button>
      </Col>
      <Col className="col-6">
        <h2 className="p-0 m-0 fw-bold">{year}</h2>
      </Col>
      <Col className="col-3">
        <Button
          onClick={nextYear}
          size="sm"
          className="btn-dark fw-bold"
          disabled={year === budgetYears.max || budgetYearsLoading}
        >
          &#62;
        </Button>
      </Col>
    </Row>
  );
};

export default BudgetYearChooser;
