import ProgressBar from "@/components/ui/progressBar";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const WARNING_PERCENTAGE = 0.9;

const DashboardSummary = ({ dateInfo, totals }) => {
  const percentSpent = totals.current.expenses / totals.current.funds;

  let spentColor;
  let remainingText;

  if (percentSpent <= 0 && totals.current.remaining <= 0) {
    spentColor = "text-danger";
    remainingText = "You're overspending!";
  } else if (percentSpent >= 0 && percentSpent >= WARNING_PERCENTAGE) {
    spentColor = "text-warning";
    remainingText = "Close to limit";
  } else {
    spentColor = "text-success";
    remainingText = "On track";
  }

  return (
    <Card className="bg-light shadow-sm border-0 rounded-4">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={8}>
            <h5 className="text-muted">
              {dateInfo.monthName} {dateInfo.year}
            </h5>
            <h2 className={`fw-bold ${spentColor}`}>
              {dollarFormatter(totals.current.remaining)} Remaining
            </h2>

            <div className="d-flex gap-4 mt-3">
              <div>
                <div className="text-muted small">Available Funds</div>
                <div className="fw-semibold">
                  {dollarFormatter(totals.current.funds)}
                </div>
              </div>
              <div>
                <div className="text-muted small">Saved</div>
                <div className="fw-semibold">
                  {dollarFormatter(totals.current.transfersOut)}
                </div>
              </div>
              <div>
                <div className="text-muted small">Expenses</div>
                <div className="fw-semibold">
                  {dollarFormatter(totals.current.expenses)}
                </div>
              </div>
            </div>
          </Col>

          <Col md={4}>
            <ProgressBar
              currentValue={totals.current.expenses}
              totalValue={totals.current.funds}
            />
            <small className={spentColor}>{remainingText}</small>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DashboardSummary;
