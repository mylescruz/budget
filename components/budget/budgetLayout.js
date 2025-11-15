import CategoryTable from "./categoryTable/categoryTable";
import { useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  CategoriesContext,
  CategoriesProvider,
} from "@/contexts/CategoriesContext";
import CategoryPieChart from "../categories/categoryPieChart";
import TransactionsLayout from "./transactions/transactionsLayout";
import {
  TransactionsContext,
  TransactionsProvider,
} from "@/contexts/TransactionsContext";
import { PaychecksProvider } from "@/contexts/PaychecksContext";
import {
  MonthIncomeProvider,
  MonthIncomeContext,
} from "@/contexts/MonthIncomeContext";
import LoadingIndicator from "../layout/loadingIndicator";

const InnerBudgetLayout = ({ dateInfo }) => {
  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { transactionsLoading } = useContext(TransactionsContext);
  const { monthIncomeLoading } = useContext(MonthIncomeContext);

  if (categoriesLoading || transactionsLoading || monthIncomeLoading) {
    return <LoadingIndicator />;
  } else if (categories) {
    return (
      <Container className="w-100">
        <aside className="info-text mx-auto text-center">
          <h1>
            {dateInfo.monthName} {dateInfo.year}
          </h1>
          <p className="fs-6">
            Set your budget for your fixed and variable expenses. Log all your
            transactions made this month. See how much you spent based on the
            category.
          </p>
        </aside>

        <Row>
          <Col className="col-12 col-xl-6">
            <CategoryPieChart categories={categories} />
          </Col>
          <Col className="col-12 col-xl-6">
            <CategoryTable dateInfo={dateInfo} />
          </Col>
        </Row>

        <TransactionsLayout dateInfo={dateInfo} />
      </Container>
    );
  }
};

const BudgetLayout = ({ dateInfo }) => {
  return (
    <CategoriesProvider dateInfo={dateInfo}>
      <TransactionsProvider dateInfo={dateInfo}>
        <PaychecksProvider dateInfo={dateInfo}>
          <MonthIncomeProvider dateInfo={dateInfo}>
            <InnerBudgetLayout dateInfo={dateInfo} />
          </MonthIncomeProvider>
        </PaychecksProvider>
      </TransactionsProvider>
    </CategoriesProvider>
  );
};

export default BudgetLayout;
