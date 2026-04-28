import { useContext, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import TransactionsLayout from "./transactions/transactionsLayout";
import LoadingIndicator from "../ui/loadingIndicator";
import TotalsLayout from "./totals/totalsLayout";
import BudgetMonthSwitcher from "../ui/budgetMonthSwitcher";
import SuccessMessage from "../ui/successMessage";
import ErrorMessage from "../ui/errorMessage";
import { BudgetContext, BudgetProvider } from "@/contexts/BudgetContext";
import CategoriesLayout from "./categoriesLayout/categoriesLayout";

const InnerBudgetLayout = ({ dateInfo }) => {
  const { budgetRequest } = useContext(BudgetContext);

  const budgetLoading =
    budgetRequest.action === "get" && budgetRequest.status === "loading";
  const budgetError =
    budgetRequest.action === "get" && budgetRequest.status === "error";
  const successAction =
    budgetRequest.action !== "get" && budgetRequest.status === "success";
  const budgetMessage = budgetRequest.message;

  if (budgetLoading) {
    return (
      <LoadingIndicator
        message={`Loading your budget for ${dateInfo.monthName} ${dateInfo.year}`}
      />
    );
  } else {
    return (
      <Container>
        {budgetError ? (
          <ErrorMessage message={budgetMessage} />
        ) : (
          <>
            <Row className="d-flex justify-content-center">
              <Col className="col-12 col-xl-10">
                <TotalsLayout />

                <CategoriesLayout dateInfo={dateInfo} />

                <TransactionsLayout dateInfo={dateInfo} />
              </Col>
            </Row>

            <SuccessMessage show={successAction} message={budgetMessage} />
          </>
        )}
      </Container>
    );
  }
};

const BudgetLayout = ({ dateInfo }) => {
  const [monthInfo, setMonthInfo] = useState(dateInfo);

  const pageInfo = {
    title: `${monthInfo.monthName} ${monthInfo.year}`,
    description:
      "Set your budget for your fixed and changing expenses. Log all your transactions made this month. See how much you spent based on the category.",
  };

  return (
    <BudgetProvider month={monthInfo.month} year={monthInfo.year}>
      <BudgetMonthSwitcher
        monthInfo={monthInfo}
        setMonthInfo={setMonthInfo}
        pageInfo={pageInfo}
      >
        <InnerBudgetLayout dateInfo={monthInfo} />
      </BudgetMonthSwitcher>
    </BudgetProvider>
  );
};

export default BudgetLayout;
