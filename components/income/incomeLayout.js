import { Button, Container, Row } from "react-bootstrap";
import { useMemo, useState } from "react";
import LoadingIndicator from "../ui/loadingIndicator";
import useIncome from "@/hooks/useIncome";
import AddIncomeModal from "./addIncomeModal";
import IncomeTotalsLayout from "./incomeTotalsLayout";
import BudgetYearSwitcher from "../ui/budgetYearSwitcher";
import EditIncomeModal from "./editIncomeModal";
import IncomeDetailsModal from "./incomeDetailsModal";
import DeleteIncomeModal from "./deleteIncomeModal";
import DataTableLayout from "../ui/dataTableLayout/dataTableLayout";
import SuccessMessage from "../ui/successMessage";

const InnerIncomeLayout = ({ year }) => {
  const {
    income,
    incomeRequest,
    postIncome,
    putIncome,
    deleteIncome,
    incomeTotals,
  } = useIncome(year);

  const [modal, setModal] = useState("none");

  const [chosenSource, setChosenSource] = useState(null);

  const formattedIncome = useMemo(() => {
    if (!income) {
      return null;
    }

    return income.map((source) => {
      return {
        _id: source._id,
        date: source.date,
        name: source.name,
        description: source.description,
        type: source.type,
        amount: source.amount,
      };
    });
  }, [income]);

  const incomeColumns = {
    column1: "Date",
    column2: "Source",
    column3: "Type",
    column4: "Amount",
  };

  const openAddModal = () => {
    setModal("addIncome");
  };

  const openIncomeDetails = (sourceId) => {
    const foundSource = income.find((source) => source._id === sourceId);

    setChosenSource({ ...foundSource, new: false });

    setModal("incomeDetails");
  };

  if (incomeRequest.action === "get" && incomeRequest.status === "loading") {
    return <LoadingIndicator message={incomeRequest.message} />;
  } else {
    return (
      <Container>
        <Container className="d-flex align-items-center justify-content-between col-12 col-xl-10 mx-auto mt-2">
          <h4 className="my-0">Income</h4>
          <Button variant="primary" onClick={openAddModal}>
            + Add Income
          </Button>
        </Container>

        {income && <IncomeTotalsLayout incomeTotals={incomeTotals} />}

        {income ? (
          <Row className="d-flex align-items-center col-12 col-xl-10 mt-2 mb-4 mx-auto">
            <DataTableLayout
              data={formattedIncome}
              columns={incomeColumns}
              type={"income"}
              openDetails={openIncomeDetails}
            />
          </Row>
        ) : (
          <p className="mt-4 text-danger fw-bold text-center">
            &#9432; {incomeRequest.message}
          </p>
        )}

        {modal === "addIncome" && (
          <AddIncomeModal
            year={year}
            postIncome={postIncome}
            incomeRequest={incomeRequest}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "incomeDetails" && (
          <IncomeDetailsModal
            chosenSource={chosenSource}
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "editIncome" && (
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

        {modal === "deleteIncome" && (
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
    description: "Keep track of all your income for the year.",
  };

  return (
    <BudgetYearSwitcher year={year} setYear={setYear} pageInfo={pageInfo}>
      <InnerIncomeLayout year={year} />
    </BudgetYearSwitcher>
  );
};

export default IncomeLayout;
