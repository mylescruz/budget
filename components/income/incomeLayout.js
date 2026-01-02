import { Button, Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import LoadingIndicator from "../layout/loadingIndicator";
import BudgetYearChooser from "../layout/budgetYearChooser";
import useIncome from "@/hooks/useIncome";
import AddIncomeModal from "./addIncomeModal";
import IncomeTable from "./incomeTable/incomeTable";

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
      <Container className="w-100">
        <Container className="text-center mt-4">
          <Button variant="primary" onClick={openAddIncomeModal}>
            Add Income
          </Button>
        </Container>

        {income.length === 0 ? (
          <div className="mt-4 fw-bold text-center">
            &#9432; You don't have any income yet! Enter a new source above.
          </div>
        ) : (
          <Row className="d-flex my-4">
            <Col className="mx-auto col-12 col-lg-10">
              <IncomeTable
                income={income}
                year={year}
                putIncome={putIncome}
                deleteIncome={deleteIncome}
                incomeTotals={incomeTotals}
              />
            </Col>
          </Row>
        )}

        <AddIncomeModal {...AddIncomeModalProps} />
      </Container>
    );
  }
};

const IncomeLayout = ({ dateInfo }) => {
  // Define state to change years for user
  const [year, setYear] = useState(dateInfo.year);

  return (
    <Container className="w-100">
      <aside className="text-center">
        <h1>Income</h1>
        <p>View and add all your income for the current year.</p>
      </aside>

      <BudgetYearChooser year={year} setYear={setYear} />

      <InnerIncomeLayout year={year} />
    </Container>
  );
};

export default IncomeLayout;
