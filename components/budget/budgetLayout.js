import CategoryTable from "./categoryTable/categoryTable";
import { useContext } from "react";
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

const InnerBudgetLayout = ({ dateInfo }) => {
  const { categories, categoriesLoading } = useContext(CategoriesContext);
  const { transactionsLoading } = useContext(TransactionsContext);

  if (categoriesLoading || transactionsLoading) {
    return <LoadingIndicator />;
  } else if (categories) {
    return (
      <Container className="w-100">
        <aside className="info-text mx-auto text-center">
          <h1>
            {dateInfo.monthName} {dateInfo.year}
          </h1>
          <p className="fs-6">
            Set your budget for your fixed and changing expenses. Log all your
            transactions made this month. See how much you spent based on the
            category.
          </p>
        </aside>

        <Row className="d-flex flex-column flex-lg-row align-items-center">
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
        <InnerBudgetLayout dateInfo={dateInfo} />
      </TransactionsProvider>
    </CategoriesProvider>
  );
};

export default BudgetLayout;
