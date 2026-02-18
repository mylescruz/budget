import useSummary from "@/hooks/useSummary";
import { Button, Col, Container, Row } from "react-bootstrap";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import LoadingIndicator from "../layout/loadingIndicator";
import { useState } from "react";
import TotalsCards from "./totalsCards/totalsCards";
import SpendingInsightsLayout from "./spendingInsights/spendingInsightsLayout";
import CategorySummaryTable from "./categorySummary/categorySummaryTable";
import TransactionsSummaryLayout from "./transactionsSummaryTable/transactionsSummaryLayout";
import useBudgetMonths from "@/hooks/useBudgetMonths";

const InnerSummaryLayout = ({ year }) => {
  const { summary, summaryLoading } = useSummary(year);

  if (summaryLoading) {
    return <LoadingIndicator />;
  } else if (summary.categories.length === 0 || !summary) {
    return (
      <Row className="text-danger fw-bold text-center">
        <p>
          &#9432; There was an error loading your summary for the year. Please
          try again later!
        </p>
      </Row>
    );
  } else {
    return (
      <div className="mx-auto">
        <Row className="my-4 d-flex justify-content-center text-center">
          <h3>Year Totals</h3>
          <Col className="col-12 col-lg-10">
            <TotalsCards summary={summary} />
          </Col>
        </Row>

        <Row className="d-flex justify-content-center">
          <Col className="col-12 col-xl-10">
            <SpendingInsightsLayout
              categories={summary.categories}
              months={summary.months}
              transactions={summary.transactions}
            />
          </Col>
        </Row>

        <Row className="my-4 mx-auto">
          <h3 className="text-center">Categories Breakdown</h3>
          <CategoryPieChart categories={summary.categories} />
          <Col className="col-12 col-xl-10 mx-auto">
            <CategorySummaryTable
              categories={summary.categories}
              year={year}
              monthsLength={summary.monthsLength}
            />
          </Col>
        </Row>

        <Row className="my-4 mx-auto">
          <h3 className="text-center">{year} Transactions</h3>
          <Col className="col-12 col-xl-10 mx-auto">
            <TransactionsSummaryLayout
              transactions={summary.transactions}
              categories={summary.categories}
            />
          </Col>
        </Row>
      </div>
    );
  }
};

const SummaryLayout = () => {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());

  const { budgetMonths, budgetMonthsLoading } = useBudgetMonths();

  const previousYear = () => {
    setYear((prev) => prev - 1);
  };

  const nextYear = () => {
    setYear((prev) => prev + 1);
  };

  if (budgetMonthsLoading) {
    return <LoadingIndicator />;
  } else if (!budgetMonths) {
    return (
      <Row className="mt-4 text-center">
        <p className="fw-bold text-danger">
          &#9432; There was an error loading your budget months. Please try
          again later!
        </p>
      </Row>
    );
  } else {
    return (
      <div className="mx-auto">
        <Row className="d-flex col-12 col-md-8 col-lg-6 col-xl-5 justify-items-between mx-auto align-items-center text-center">
          <Col className="col-2">
            <Button
              onClick={previousYear}
              size="sm"
              className="btn-dark fw-bold"
              disabled={year === budgetMonths.min.year}
            >
              &#60;
            </Button>
          </Col>
          <Col className="col-8">
            <h1 className="p-0 m-0 fw-bold">{year} Summary</h1>
          </Col>
          <Col className="col-2">
            <Button
              onClick={nextYear}
              size="sm"
              className="btn-dark fw-bold"
              disabled={year === budgetMonths.max.year}
            >
              &#62;
            </Button>
          </Col>
        </Row>
        <Container className="my-2 mx-auto text-center">
          <p>View all your spending summaries for the year.</p>
        </Container>

        <InnerSummaryLayout year={year} />
      </div>
    );
  }
};

export default SummaryLayout;
