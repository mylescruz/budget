import useSummary from "@/hooks/useSummary";
import { Col, Container, Row } from "react-bootstrap";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import LoadingIndicator from "../layout/loadingIndicator";
import { useState } from "react";
import BudgetYearChooser from "../layout/budgetYearChooser";
import CategorySummaryTable from "./categorySummaryTable";
import TotalsCards from "./totalsCards";
import Top10Layout from "./top10/top10Layout";

const InnerSummaryLayout = ({ year }) => {
  const { summary, summaryLoading } = useSummary(year);

  if (summaryLoading) {
    return <LoadingIndicator />;
  } else if (summary) {
    return (
      <div className="mx-auto">
        <Row className="my-4 d-flex justify-content-center text-center">
          <h3>Year Totals</h3>
          <Col className="col-12 col-lg-10">
            <TotalsCards summary={summary} />
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

        <Row className="d-flex justify-content-center">
          <h3 className="text-center">Top Spending Insights</h3>
          <Col className="col-12 col-xl-10">
            <Top10Layout top10={summary.top10} months={summary.months} />
          </Col>
        </Row>
      </div>
    );
  }
};

const SummaryLayout = ({ dateInfo }) => {
  // Define state to change years for user
  const [year, setYear] = useState(dateInfo.year);

  return (
    <Container className="w-100">
      <aside className="info-text text-center mx-auto">
        <h1>Summary</h1>
        <p>View all your spending summaries for the year.</p>
      </aside>

      <BudgetYearChooser year={year} setYear={setYear} />

      <InnerSummaryLayout year={year} />
    </Container>
  );
};

export default SummaryLayout;
