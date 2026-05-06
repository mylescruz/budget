import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Row } from "react-bootstrap";

const IncomeHeader = ({ incomeTotals }) => {
  return (
    <>
      <Row className="col-12 col-xl-10 my-2 mx-auto d-flex justify-content-center">
        <Card className="shadow-sm border-0 rounded-4 mb-4">
          <Card.Body>
            <div className="d-flex flex-row justify-content-between">
              <div className="mx-2">
                <div className="text-muted small">Total Net</div>
                <h2 className="fw-semibold">
                  {dollarFormatter(incomeTotals.amount)}
                </h2>
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row">
              <div className="mx-2 my-1">
                <div className="text-muted small">Total Gross</div>
                <div className="fw-semibold">
                  {dollarFormatter(incomeTotals.gross)}
                </div>
              </div>
              <div className="mx-2 my-1">
                <div className="text-muted small">Total Deductions</div>
                <div className="fw-semibold">
                  {dollarFormatter(incomeTotals.deductions)} (
                  {Math.round(
                    (incomeTotals.deductions / incomeTotals.gross) * 100,
                  )}
                  %)
                </div>
              </div>
              <div className="mx-2 my-1">
                <div className="text-muted small">Number of Sources</div>
                <div className="fw-semibold">{incomeTotals.numSources}</div>
              </div>
              <div className="mx-2 my-1">
                <div className="text-muted small">Avg Gross Per Source</div>
                <div className="fw-semibold">
                  {dollarFormatter(
                    incomeTotals.gross / incomeTotals.numSources,
                  )}
                </div>
              </div>
              <div className="mx-2 my-1">
                <div className="text-muted small">Avg Net Per Source</div>
                <div className="fw-semibold">
                  {dollarFormatter(
                    incomeTotals.amount / incomeTotals.numSources,
                  )}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Row>
    </>
  );
};

export default IncomeHeader;
