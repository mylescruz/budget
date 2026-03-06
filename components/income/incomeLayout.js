import { Button, Container, Row } from "react-bootstrap";
import { useMemo, useState } from "react";
import LoadingIndicator from "../layout/loadingIndicator";
import useIncome from "@/hooks/useIncome";
import AddIncomeModal from "./addIncomeModal";
import IncomeTotalsLayout from "./incomeTotalsLayout";
import BudgetYearSwitcher from "../layout/budgetYearSwitcher";
import EditIncomeModal from "./editIncomeModal";
import IncomeDetailsModal from "./incomeDetailsModal";
import DeleteIncomeModal from "./deleteIncomeModal";
import DataTableLayout from "../layout/dataTableLayout/dataTableLayout";

const InnerIncomeLayout = ({ year }) => {
  const {
    income,
    incomeLoading,
    postIncome,
    putIncome,
    deleteIncome,
    incomeTotals,
  } = useIncome(year);

  const [modal, setModal] = useState("none");

  const [chosenSource, setChosenSource] = useState(null);

  const formattedIncome = useMemo(() => {
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

    setChosenSource(foundSource);

    setModal("incomeDetails");
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
      <Container>
        <IncomeTotalsLayout incomeTotals={incomeTotals} />

        <Container className="text-center mt-2">
          <Button variant="primary" onClick={openAddModal}>
            Add Income
          </Button>
        </Container>

        {income.length === 0 ? (
          <div className="mt-4 fw-bold text-center">
            &#9432; You don't have any income yet! Enter a new source above.
          </div>
        ) : (
          <Row className="d-flex align-items-center col-12 col-xl-10 mt-2 mb-4 mx-auto">
            <DataTableLayout
              data={formattedIncome}
              columns={incomeColumns}
              type={"income"}
              openDetails={openIncomeDetails}
            />
          </Row>
        )}

        {modal === "addIncome" && (
          <AddIncomeModal
            year={year}
            postIncome={postIncome}
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
            modal={modal}
            setModal={setModal}
          />
        )}

        {modal === "deleteIncome" && (
          <DeleteIncomeModal
            chosenSource={chosenSource}
            deleteIncome={deleteIncome}
            modal={modal}
            setModal={setModal}
          />
        )}
      </Container>
    );
  }
};

const IncomeLayout = ({ dateInfo }) => {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());

  const pageInfo = {
    title: "Income",
    description: "View and add all your income for the current year.",
  };

  return (
    <BudgetYearSwitcher year={year} setYear={setYear} pageInfo={pageInfo}>
      <InnerIncomeLayout year={year} />
    </BudgetYearSwitcher>
  );
};

export default IncomeLayout;
