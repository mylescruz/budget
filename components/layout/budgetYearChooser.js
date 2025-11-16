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
    <Row className="d-flex align-items-center text-center">
      <Col className="col-4">
        <Button onClick={previousYear} disabled={year === budgetYears.min}>
          {year - 1}
        </Button>
      </Col>
      <Col className="col-4">
        <h2>{year}</h2>
      </Col>
      <Col className="col-4">
        <Button onClick={nextYear} disabled={year === budgetYears.max}>
          {year + 1}
        </Button>
      </Col>
    </Row>
  );
};

export default BudgetYearChooser;
