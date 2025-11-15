import useSummary from "@/hooks/useSummary";
import SummaryTable from "./summaryTable";
import { Col, Container, Row } from "react-bootstrap";
import CategoryPieChart from "../categories/categoryPieChart";
import TopStoresChart from "./topStoresChart";
import MonthsChart from "./monthsChart";
import LoadingIndicator from "../layout/loadingIndicator";

const SummaryLayout = ({ dateInfo }) => {
  const { summary, summaryLoading } = useSummary(dateInfo.year);

  if (summaryLoading || !summary) {
    return <LoadingIndicator />;
  } else if (summary) {
    return (
      <Container className="w-100">
        <aside className="info-text text-center mx-auto">
          <h1>{dateInfo.year} Summary</h1>
          <p>View all your spending summaries for the year.</p>
        </aside>

        <Row className="my-4 d-flex justify-content-center text-center">
          <h3>Highest, Lowest & Average Months</h3>
          <MonthsChart months={summary.months} />
        </Row>

        <Row className="my-4 d-flex align-items-start">
          <Row className="col-12 col-xl-6">
            <Col className="col-12 mt-4">
              <h3 className="text-center">Fixed Categories</h3>
              <CategoryPieChart categories={summary.categories.fixed} />
            </Col>
            <Col className="col-12">
              <SummaryTable
                categories={summary.categories.fixed}
                year={dateInfo.year}
              />
            </Col>
          </Row>
          <Row className="mb-4 col-12 col-xl-6">
            <Col className="col-12 mt-4">
              <h3 className="text-center">Changing Categories</h3>
              <CategoryPieChart categories={summary.categories.changing} />
            </Col>
            <Col className="col-12">
              <SummaryTable
                categories={summary.categories.changing}
                year={dateInfo.year}
              />
            </Col>
          </Row>
        </Row>

        <Row className="d-flex justify-content-center text-center">
          <h3>Top 10 Stores Shopped At</h3>
          <TopStoresChart topStores={summary.topStores} />
        </Row>
      </Container>
    );
  }
};

export default SummaryLayout;
