import useSummary from "@/hooks/useSummary";
import { Col, Container, Row } from "react-bootstrap";
import CategoryPieChart from "../categoriesCharts/categoryPieChart";
import TopStoresChart from "./topStoresChart";
import LoadingIndicator from "../layout/loadingIndicator";
import { useState } from "react";
import BudgetYearChooser from "../layout/budgetYearChooser";
import IncomeSummary from "./incomeSummaryTable";
import CategorySummaryTable from "./categorySummaryTable";
import MonthsSummary from "./monthsSummary";

const InnerSummaryLayout = ({ year }) => {
  const { summary, summaryLoading } = useSummary(year);

  if (summaryLoading) {
    return <LoadingIndicator />;
  } else if (summary) {
    return (
      <div className="mx-auto">
        <Row className="my-4 mx-auto">
          <h3 className="text-center">Income</h3>
          <Col className="col-12 col-md-10 col-lg-8 col-xl-6 mx-auto">
            <IncomeSummary income={summary.income} />
          </Col>
        </Row>

        <Row className="my-4 mx-auto">
          <h3 className="text-center">Categories</h3>
          <CategoryPieChart categories={summary.categories} />
          <Col className="col-12 col-xl-10 mx-auto">
            <CategorySummaryTable
              categories={summary.categories}
              year={year}
              monthsLength={summary.monthsLength}
            />
          </Col>
        </Row>

        <Row className="my-4 d-flex justify-content-center text-center">
          <h3>Highest, Lowest & Average Months</h3>
          <Col className="col-12 col-lg-10">
            <MonthsSummary months={summary.months} />
          </Col>
        </Row>

        {summary.topStores.length > 0 && (
          <Row className="d-flex justify-content-center text-center">
            <h3>Top 10 Stores Shopped At</h3>
            <TopStoresChart topStores={summary.topStores} />
          </Row>
        )}
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
