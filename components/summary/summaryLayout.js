import useSummary from "@/hooks/useSummary";
import { Container, Row } from "react-bootstrap";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import LoadingIndicator from "../ui/loadingIndicator";
import { useState } from "react";
import TotalsCards from "./totalsCards/totalsCards";
import SpendingInsightsLayout from "./spendingInsights/spendingInsightsLayout";
import CategorySummaryTable from "./categorySummary/categorySummaryTable";
import TransactionsSummaryLayout from "./transactionsSummaryTable/transactionsSummaryLayout";
import BudgetYearSwitcher from "../ui/budgetYearSwitcher";
import ErrorMessage from "../ui/errorMessage";

const InnerSummaryLayout = ({ year }) => {
  const { summary, summaryRequest } = useSummary(year);

  if (summaryRequest.action === "get" && summaryRequest.status === "loading") {
    return <LoadingIndicator message={summaryRequest.message} />;
  } else {
    return (
      <Container>
        {summary ? (
          <Row className="mx-auto d-flex justify-content-center align-items-center col-12 col-xl-10">
            <div className="my-4 text-center">
              <h3>Year Totals</h3>
              <TotalsCards summary={summary} />
            </div>

            <div className="my-4">
              <SpendingInsightsLayout
                categories={summary.categories}
                months={summary.months}
                transactions={summary.transactions}
              />
            </div>

            <div className="my-4">
              <h3 className="text-center">Categories Breakdown</h3>
              <CategoryPieChart categories={summary.categories} />
              <CategorySummaryTable
                categories={summary.categories}
                year={year}
                monthsLength={summary.monthsLength}
              />
            </div>

            <div className="my-4">
              <h3 className="text-center">{year} Transactions</h3>
              <TransactionsSummaryLayout transactions={summary.transactions} />
            </div>
          </Row>
        ) : (
          <ErrorMessage message={summaryRequest.message} />
        )}
      </Container>
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
