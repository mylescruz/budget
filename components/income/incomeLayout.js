import AddPaycheckModal from "./addPaycheckModal";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import PaychecksTable from "./paychecksTable";
import LoadingIndicator from "../layout/loadingIndicator";
import usePaychecks from "@/hooks/usePaychecks";
import BudgetYearChooser from "../layout/budgetYearChooser";

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

  if (paychecksLoading) {
    return <LoadingIndicator />;
  } else if (paychecks) {
    return (
      <Container className="w-100">
        <Container className="text-center mt-4">
          <Button id="add-paycheck-btn" variant="primary" onClick={addPay}>
            Add Paycheck
          </Button>
        </Container>

        <Row className="d-flex my-4">
          <Col className="col-11 col-md-10 mx-auto">
            <PaychecksTable
              paychecks={paychecks}
              year={year}
              putPaycheck={putPaycheck}
              deletePaycheck={deletePaycheck}
            />
          </Col>
        </Row>

        {addPaycheckClicked && <AddPaycheckModal {...AddPaycheckModalProps} />}
      </Container>
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

  return (
    <Container className="w-100">
      <aside className="info-text text-center mx-auto">
        <h1>Income</h1>
        <p>
          View and add your paychecks for the current year. View your gross and
          net paychecks and see how much taxes have been taken out.
        </p>
      </aside>

      <BudgetYearChooser year={year} setYear={setYear} />

      <InnerIncomeLayout year={year} />
    </Container>
  );
};

export default IncomeLayout;
