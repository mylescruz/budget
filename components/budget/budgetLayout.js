import { useContext, useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import TransactionsLayout from "./transactions/transactionsLayout";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import LoadingIndicator from "../ui/loadingIndicator";
import TotalsLayout from "./totals/totalsLayout";
import CategoryTableLayout from "./categoryTableLayout/categoryTableLayout";
import BudgetMonthSwitcher from "../ui/budgetMonthSwitcher";
import SuccessMessage from "../ui/successMessage";
import ErrorMessage from "../ui/errorMessage";
import { BudgetContext, BudgetProvider } from "@/contexts/BudgetContext";

const InnerBudgetLayout = ({ dateInfo }) => {
  const { categories, budgetRequest } = useContext(BudgetContext);

  const budgetStatus = useMemo(
    () => ({
      isInitialLoad:
        budgetRequest.action === "get" && budgetRequest.status === "loading",
      isSuccess:
        budgetRequest.action !== "get" && budgetRequest.status === "success",
      message: budgetRequest.message,
    }),
    [budgetRequest],
  );

  if (budgetStatus.isInitialLoad) {
    return (
      <LoadingIndicator
        message={`Loading your budget for ${dateInfo.monthName} ${dateInfo.year}`}
      />
    );
  } else {
    return (
      <Container>
        <Row className="d-flex justify-content-center">
          <Col className="col-12 col-xl-10">
            <TotalsLayout />

            {categories ? (
              <>
                <CategoryPieChart categories={categories} />

                <CategoryTableLayout dateInfo={dateInfo} />
              </>
            ) : (
              <ErrorMessage message={budgetRequest.message} />
            )}

            <TransactionsLayout dateInfo={dateInfo} />
          </Col>
        </Row>

        <SuccessMessage
          show={budgetStatus.isSuccess}
          message={budgetStatus.message}
        />
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
      <CategoriesProvider dateInfo={monthInfo}>
        <TransactionsProvider dateInfo={monthInfo}>
          <BudgetMonthSwitcher
            monthInfo={monthInfo}
            setMonthInfo={setMonthInfo}
            pageInfo={pageInfo}
          >
            <InnerBudgetLayout dateInfo={monthInfo} />
          </BudgetMonthSwitcher>
        </TransactionsProvider>
      </CategoriesProvider>
    </BudgetProvider>
  );
};

export default BudgetLayout;
