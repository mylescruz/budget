import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const WARNING_PERCENTAGE = 90;

const DashboardSummary = ({ dateInfo, totals }) => {
  // The percentage of money spent this money
  let outflowPercent = Math.min(
    100,
    Math.round((totals.current.expenses / totals.current.funds) * 100),
  );

  // Keep percentage below 100 if there's any remaining funds to spend but the percentage was calculated to 100
  if (
    outflowPercent === 100 &&
    totals.current.remaining > 0 &&
    totals.current.funds !== 0
  ) {
    outflowPercent = 99;
  }

  // Display the proper text if a user is under or over budget
  const remainingText =
    totals.current.remaining >= 0
      ? `${dollarFormatter(totals.current.remaining)} Remaining`
      : `${dollarFormatter(Math.abs(totals.current.remaining))} Over Budget`;

  // Determine the color to show based on if the user is under budget, close to their budget or over budget
  let remainingColor;
  let outflowColor;

  if (outflowPercent <= 0 || totals.current.remaining <= 0) {
    remainingColor = "text-danger";
    outflowColor = "bg-danger";
  } else if (outflowPercent >= WARNING_PERCENTAGE && outflowPercent < 100) {
    remainingColor = "text-warning";
    outflowColor = "bg-warning";
  } else {
    remainingColor = "text-success";
    outflowColor = "bg-success";
  }

  return (
    <Col xs={12}>
      <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
        <Row className="align-items-center">
          <Col md={8}>
            <h5 className="text-muted">
              {dateInfo.monthName} {dateInfo.year}
            </h5>
            <h2 className={`fw-bold ${remainingColor}`}>{remainingText}</h2>

            <div className="d-flex gap-4 mt-3">
              <div>
                <div className="text-muted small">Total Inflow</div>
                <div
                  className={`fw-semibold ${totals.current.funds === 0 ? "text-danger" : "text-dark"}`}
                >
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
                <div className="text-muted small">Total Expenses</div>
                <div className="fw-semibold">
                  {dollarFormatter(totals.current.expenses)} (
                  <span className={remainingColor}>{outflowPercent}%</span>)
                </div>
              </div>
            </div>
          </Col>

          <div className="mt-2">
            <div className="progress" style={{ height: 6 }}>
              <div
                className={`progress-bar ${outflowColor}`}
                style={{ width: `${outflowPercent}%` }}
              />
            </div>
          </div>
        </Row>
      </div>
    </Col>
  );
};

export default DashboardSummary;
