import { useContext, useState } from "react";
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
import LoadingIndicator from "../layout/loadingIndicator";
import TotalsLayout from "./totals/totalsLayout";
import CategoryTableLayout from "./categoryTableLayout/categoryTableLayout";
import BudgetMonthSwitcher from "../layout/budgetMonthSwitcher";

const InnerBudgetLayout = ({ dateInfo }) => {
  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { transactionsLoading } = useContext(TransactionsContext);

  if (categoriesLoading || transactionsLoading) {
    return <LoadingIndicator />;
  } else if (!categories) {
    return (
      <Row className="mt-4 text-center">
        <p className="fw-bold text-danger">
          &#9432; There was an error loading your budget. Please try again
          later!
        </p>
      </Row>
    );
  } else {
    return (
      <Container className="w-100">
        <Row className="d-flex justify-content-center">
          <Col className="col-12 col-xl-10">
            <TotalsLayout />
          </Col>
        </Row>

        <Row className="d-flex flex-column flex-lg-row align-items-center">
          <Col className="col-12 col-xl-4">
            <CategoryPieChart categories={categories} />
          </Col>
          <Col className="col-12 col-xl-8">
            <CategoryTableLayout dateInfo={dateInfo} />
          </Col>
        </Row>

        <TransactionsLayout dateInfo={dateInfo} />
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
