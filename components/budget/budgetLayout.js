import { useContext, useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  CategoriesContext,
  CategoriesProvider,
} from "@/contexts/CategoriesContext";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import TransactionsLayout from "./transactions/transactionsLayout";
import {
  TransactionsContext,
  TransactionsProvider,
} from "@/contexts/TransactionsContext";
import LoadingIndicator from "../ui/loadingIndicator";
import TotalsLayout from "./totals/totalsLayout";
import CategoryTableLayout from "./categoryTableLayout/categoryTableLayout";
import BudgetMonthSwitcher from "../ui/budgetMonthSwitcher";
import useMonthIncome from "@/hooks/useMonthIncome";
import SuccessMessage from "../ui/successMessage";
import ErrorMessage from "../ui/errorMessage";

const InnerBudgetLayout = ({ dateInfo }) => {
  const { categories, categoriesRequest } = useContext(CategoriesContext);
  const { transactionsRequest } = useContext(TransactionsContext);
  const { monthIncome, monthIncomeRequest } = useMonthIncome(
    dateInfo.month,
    dateInfo.year,
  );

  const budgetStatus = useMemo(
    () => ({
      isInitialLoad:
        (categoriesRequest.action === "get" &&
          categoriesRequest.status === "loading") ||
        (transactionsRequest.action === "get" &&
          transactionsRequest.status === "loading") ||
        (monthIncomeRequest.action === "get" &&
          monthIncomeRequest.status === "loading"),
      categorySuccess:
        categoriesRequest.action !== "get" &&
        categoriesRequest.status === "success",
      transactionSuccess:
        transactionsRequest.action !== "get" &&
        transactionsRequest.status === "success",
      categoryMessage: categoriesRequest.message,
      transactionMessage: transactionsRequest.message,
    }),
    [categoriesRequest, transactionsRequest, monthIncomeRequest],
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
            <TotalsLayout
              monthIncome={monthIncome}
              monthIncomeRequest={monthIncomeRequest}
            />

            {categories ? (
              <>
                <CategoryPieChart categories={categories} />

                <CategoryTableLayout dateInfo={dateInfo} />
              </>
            ) : (
              <ErrorMessage message={categoriesRequest.message} />
            )}

            <TransactionsLayout dateInfo={dateInfo} />
          </Col>
        </Row>

        <SuccessMessage
          show={budgetStatus.categorySuccess || budgetStatus.transactionSuccess}
          message={
            budgetStatus.categorySuccess
              ? budgetStatus.categoryMessage
              : transactionsRequest.message
          }
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
  );
};

export default BudgetLayout;
