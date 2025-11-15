import AddPaycheckModal from "./addPaycheckModal";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import PaychecksTable from "./paychecksTable";
import LoadingIndicator from "../layout/loadingIndicator";
import useBudgetYears from "@/hooks/useBudgetYears";
import usePaychecks from "@/hooks/usePaychecks";

const InnerIncomeLayout = ({ year }) => {
  const {
    paychecks,
    paychecksLoading,
    postPaycheck,
    putPaycheck,
    deletePaycheck,
  } = usePaychecks(year);
  const [addPaycheckClicked, setAddPaycheckClicked] = useState(false);

  const addPay = () => {
    setAddPaycheckClicked(true);
  };

  const AddPaycheckModalProps = {
    year: year,
    postPaycheck: postPaycheck,
    addPaycheckClicked: addPaycheckClicked,
    setAddPaycheckClicked: setAddPaycheckClicked,
  };

  if (paychecksLoading && !paychecks) {
    return <LoadingIndicator />;
  } else if (paychecks) {
    return (
      <>
        <aside className="info-text text-center mx-auto">
          <h1>{year} Income</h1>
          <p>
            View and add your paychecks for the current year. View your gross
            and net paychecks and see how much taxes have been taken out.
          </p>
        </aside>

        <Container className="text-center">
          <Button id="add-paycheck-btn" variant="primary" onClick={addPay}>
            Add Paycheck
          </Button>
        </Container>

        <Row className="d-flex my-4">
          <Col className="col-11 col-md-10 col-xl-8 mx-auto">
            <PaychecksTable
              paychecks={paychecks}
              year={year}
              putPaycheck={putPaycheck}
              deletePaycheck={deletePaycheck}
            />
          </Col>
        </Row>

        {addPaycheckClicked && <AddPaycheckModal {...AddPaycheckModalProps} />}
      </>
    );
  } else {
    return (
      <Row className="text-danger fw-bold text-center">
        <p>
          &#9432; There was an error loading your paychecks. Please try again
          later!
        </p>
      </Row>
    );
  }
};

const IncomeLayout = ({ dateInfo }) => {
  // Define state to change years for user
  const [year, setYear] = useState(dateInfo.year);
  const { budgetYears, budgetYearsLoading } = useBudgetYears();

  // Set the current year
  useEffect(() => {
    if (!budgetYearsLoading && budgetYears) {
      setYear(budgetYears.current);
    }
  }, [budgetYears, budgetYearsLoading]);

  const nextYear = () => {
    setYear(year + 1);
  };

  const previousYear = () => {
    setYear(year - 1);
  };

  if (budgetYearsLoading || !budgetYears) {
    return <LoadingIndicator />;
  } else {
    return (
      <>
        <InnerIncomeLayout year={year} />

        <Row className="d-flex text-center">
          <Col className="col-6">
            <Button onClick={previousYear} disabled={year === budgetYears.min}>
              {year - 1}
            </Button>
          </Col>
          <Col className="col-6">
            <Button onClick={nextYear} disabled={year === budgetYears.max}>
              {year + 1}
            </Button>
          </Col>
        </Row>
      </>
    );
  }
};

export default IncomeLayout;
