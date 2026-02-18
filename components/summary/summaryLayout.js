import useSummary from "@/hooks/useSummary";
import { Col, Row } from "react-bootstrap";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import LoadingIndicator from "../layout/loadingIndicator";
import { useState } from "react";
import TotalsCards from "./totalsCards/totalsCards";
import SpendingInsightsLayout from "./spendingInsights/spendingInsightsLayout";
import CategorySummaryTable from "./categorySummary/categorySummaryTable";
import TransactionsSummaryLayout from "./transactionsSummaryTable/transactionsSummaryLayout";
import BudgetYearSwitcher from "../layout/budgetYearSwitcher";

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

  const pageInfo = {
    title: "Summary",
    description: "View all your spending summaries for the year.",
  };

  return (
    <BudgetYearSwitcher year={year} setYear={setYear} pageInfo={pageInfo}>
      <InnerSummaryLayout year={year} />
    </BudgetYearSwitcher>
  );
};

export default SummaryLayout;
