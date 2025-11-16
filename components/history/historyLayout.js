import { Col, Container, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";
import { useState } from "react";
import LoadingIndicator from "../layout/loadingIndicator";
import BudgetYearChooser from "../layout/budgetYearChooser";

const InnerHistoryLayout = ({ year }) => {
  const { history, historyLoading } = useHistory(year);

  if (historyLoading && !history) {
    return <LoadingIndicator />;
  } else if (history) {
    if (history.length > 0) {
      return (
        <Row className="d-flex mt-4">
          <Col className="col-11 col-md-10 mx-auto">
            <HistoryTable history={history} />
          </Col>
        </Row>
      );
    } else {
      return (
        <Row className="mt-4 fw-bold text-center">
          <p>
            &#9432; There are no previous months yet! Keep filling out your
            budget every month to see your history!
          </p>
        </Row>
      );
    }
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
