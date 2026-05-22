import useSummary from "@/hooks/useSummary";
import { Container, Row } from "react-bootstrap";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import LoadingIndicator from "../ui/loadingIndicator";
import { useMemo, useState } from "react";
import SpendingInsightsLayout from "./spendingInsights/spendingInsightsLayout";
import CategorySummaryTable from "./categorySummary/categorySummaryTable";
import BudgetYearSwitcher from "../ui/budgetYearSwitcher";
import ErrorMessage from "../ui/errorMessage";
import AveragesLayout from "./averages/averagesLayout";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";
import TotalsLayout from "./totals/totalsLayout";
import TransactionsLayout from "./transactions/transactionsLayout";

const InnerSummaryLayout = ({ year }) => {
  const { summary, summaryRequest } = useSummary(year);

  // Get the user's totals for income, expenses and transfers for the year
  const totals = useMemo(() => {
    if (!summary) {
      return null;
    }

    const totals = summary.months.reduce(
      (sum, month) => {
        sum.income += dollarsToCents(month.income);

        sum.expenses += dollarsToCents(month.actual);

        sum.transfers.in += dollarsToCents(month.transfers.in);

        sum.transfers.out += dollarsToCents(month.transfers.out);

        return sum;
      },
      { income: 0, expenses: 0, transfers: { in: 0, out: 0 } },
    );

    // Get the net cash flow for the year
    const netCashFlow = totals.income - totals.expenses;

    // Get the net savings for the year
    const netSavings = totals.transfers.out - totals.transfers.in;

    return {
      income: centsToDollars(totals.income),
      expenses: centsToDollars(totals.expenses),
      netCashFlow: centsToDollars(netCashFlow),
      toSavings: centsToDollars(totals.transfers.out),
      toChecking: centsToDollars(totals.transfers.in),
      netSavings: centsToDollars(netSavings),
      numMonths: summary.months.length,
    };
  }, [summary]);

  if (summaryRequest.action === "get" && summaryRequest.status === "loading") {
    return <LoadingIndicator message={summaryRequest.message} />;
  } else {
    return (
      <Container>
        {summary ? (
          <Row className="mx-auto d-flex justify-content-center align-items-center col-12 col-xl-10">
            <TotalsLayout months={summary.months} totals={totals} />

            <AveragesLayout totals={totals} />

            <SpendingInsightsLayout
              categories={summary.categories}
              months={summary.months}
              transactions={summary.transactions}
            />

            <div className="my-4">
              <h3 className="text-center">Categories Breakdown</h3>
              <CategoryPieChart categories={summary.categories} />
              <CategorySummaryTable
                categories={summary.categories}
                year={year}
                monthsLength={summary.monthsLength}
              />
            </div>

            <TransactionsLayout transactions={summary.transactions} />
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
