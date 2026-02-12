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
import TotalsLayout from "./totals/totalsLayout";
import CategoryTableLayout from "./categoryTableLayout/categoryTableLayout";

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
  return (
    <CategoriesProvider dateInfo={dateInfo}>
      <TransactionsProvider dateInfo={dateInfo}>
        <InnerBudgetLayout dateInfo={dateInfo} />
      </TransactionsProvider>
    </CategoriesProvider>
  );
};

export default BudgetLayout;
