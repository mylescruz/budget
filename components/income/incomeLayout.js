import { Col, Container, Row } from "react-bootstrap";
import { useMemo, useState } from "react";
import LoadingIndicator from "../ui/loadingIndicator";
import useIncome from "@/hooks/useIncome";
import AddIncomeModal from "./addIncomeModal";
import BudgetYearSwitcher from "../ui/budgetYearSwitcher";
import EditIncomeModal from "./editIncomeModal";
import IncomeDetailsModal from "./incomeDetailsModal";
import DeleteIncomeModal from "./deleteIncomeModal";
import SuccessMessage from "../ui/successMessage";
import ErrorMessage from "../ui/errorMessage";
import IncomeHeader from "./IncomeHeader";
import IncomeTable from "./incomeTable/incomeTable";

const InnerIncomeLayout = ({ year }) => {
  const {
    income,
    incomeRequest,
    postIncome,
    putIncome,
    deleteIncome,
    incomeTotals,
  } = useIncome(year);

  const [modal, setModal] = useState(null);
  const [chosenSource, setChosenSource] = useState(null);

  if (incomeRequest.action === "get" && incomeRequest.status === "loading") {
    return <LoadingIndicator message={incomeRequest.message} />;
  } else {
    return (
      <Container>
        {income ? (
          <Row className="d-flex justify-content-center">
            <Col className="col-12 col-xl-10">
              <IncomeHeader incomeTotals={incomeTotals} />
              <IncomeTable
                income={income}
                setChosenSource={setChosenSource}
                setModal={setModal}
              />
            </Col>
          </Row>
        ) : (
          <ErrorMessage message={incomeRequest.message} />
        )}

        {modal === "ADD" && (
          <AddIncomeModal
            year={year}
            postIncome={postIncome}
            incomeRequest={incomeRequest}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "DETAILS" && (
          <IncomeDetailsModal
            chosenSource={chosenSource}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "EDIT" && (
          <EditIncomeModal
            chosenSource={chosenSource}
            setChosenSource={setChosenSource}
            year={year}
            putIncome={putIncome}
            incomeRequest={incomeRequest}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "DELETE" && (
          <DeleteIncomeModal
            chosenSource={chosenSource}
            deleteIncome={deleteIncome}
            incomeRequest={incomeRequest}
            modal={modal}
            setModal={setModal}
          />
        )}

        <SuccessMessage
          show={
            incomeRequest.action !== "get" && incomeRequest.status === "success"
          }
          message={incomeRequest.message}
        />
      </Container>
    );
  }
};

const IncomeLayout = () => {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());

  const pageInfo = {
    title: "Income",
    description: "Keep track of all your income for the year.",
  };

  return (
    <BudgetYearSwitcher year={year} setYear={setYear} pageInfo={pageInfo}>
      <InnerIncomeLayout year={year} />
    </BudgetYearSwitcher>
  );
};

export default IncomeLayout;
