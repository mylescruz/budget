import { Col, Container, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";
import { useState } from "react";
import LoadingIndicator from "../layout/loadingIndicator";
import BudgetYearChooser from "../layout/budgetYearChooser";

const InnerHistoryLayout = ({ year }) => {
  const { history, historyLoading, historyTotals } = useHistory(year);

  if (historyLoading) {
    return <LoadingIndicator />;
  } else if (history) {
    return (
      <Row className="d-flex mt-4">
        <Col className="col-12 col-md-10 mx-auto">
          <HistoryTable history={history} historyTotals={historyTotals} />
        </Col>
      </Row>
    );
  } else {
    <Row className="text-danger fw-bold text-center">
      <p>
        &#9432; There was an error loading your history. Please try again later!
      </p>
    </Row>;
  }
};

const HistoryLayout = ({ dateInfo }) => {
  // Define state to change years for user
  const [year, setYear] = useState(dateInfo.year);

  return (
    <Container className="w-100">
      <aside className="info-text text-center mx-auto">
        <h1>History</h1>
        <p>View the full budget for previous months</p>
      </aside>

      <BudgetYearChooser year={year} setYear={setYear} />

      <InnerHistoryLayout year={year} />
    </Container>
  );
};

export default HistoryLayout;
