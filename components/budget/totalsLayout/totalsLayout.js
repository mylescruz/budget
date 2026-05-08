import { useContext, useMemo } from "react";
import { Card, Col, Row } from "react-bootstrap";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";
import dollarFormatter from "@/helpers/dollarFormatter";
import ErrorMessage from "@/components/ui/errorMessage";
import { BudgetContext } from "@/contexts/BudgetContext";

const WARNING_PERCENTAGE = 90;

const TotalsLayout = ({ dateInfo }) => {
  const { categoryTotals, transactionTotals } = useContext(BudgetContext);

  // Object that calculates the budget totals for the current month
  const totals = useMemo(() => {
    if (!categoryTotals || !transactionTotals) {
      return null;
    }

    const income = dollarsToCents(transactionTotals.income);

    const transfersIn = dollarsToCents(transactionTotals.transfersIn);

    const transfersOut = dollarsToCents(transactionTotals.transfersOut);

    const actual = dollarsToCents(categoryTotals.actual);

    const fixedBudget = dollarsToCents(categoryTotals.fixedBudget);

    const variableActual = dollarsToCents(categoryTotals.variableActual);

    // The total funds available to spend for the month
    const inflow = income + transfersIn;

    // The funds that left their budget
    const outflow = actual + transfersOut;

    // The remaining money left to spend after all expenses and transfers out
    const remaining = inflow - fixedBudget - variableActual - transfersOut;

    // The percentage of money spent this money
    let outflowPercent = Math.min(100, Math.round((outflow / inflow) * 100));

    // Keep percentage below 100 if there's any remaining funds to spend but the percentage was calculated to 100
    if (outflowPercent === 100 && remaining > 0 && inflow !== 0) {
      outflowPercent = 99;
    }

    if (Number.isNaN(outflowPercent)) {
      outflowPercent = 0;
    }

    // Display the proper text if a user is under or over budget
    const remainingText =
      remaining >= 0
        ? `${dollarFormatter(centsToDollars(remaining))} Remaining`
        : `${dollarFormatter(Math.abs(centsToDollars(remaining)))} Over Budget`;

    // Determine the color to show based on if the user is under budget, close to their budget or over budget
    let remainingColor;
    let outflowColor;

    if (outflowPercent <= 0 || remaining <= 0) {
      remainingColor = "text-danger";
      outflowColor = "bg-danger";
    } else if (outflowPercent >= WARNING_PERCENTAGE && outflowPercent < 100) {
      remainingColor = "text-warning";
      outflowColor = "bg-warning";
    } else {
      remainingColor = "text-success";
      outflowColor = "bg-success";
    }

    return {
      income: centsToDollars(income),
      variableActual: centsToDollars(variableActual),
      fixedBudget: centsToDollars(fixedBudget),
      transfersIn: centsToDollars(transfersIn),
      transfersOut: centsToDollars(transfersOut),
      inflow: centsToDollars(inflow),
      outflow: centsToDollars(outflow),
      remaining: centsToDollars(remaining),
      outflowPercent,
      remainingText,
      remainingColor,
      outflowColor,
    };
  }, [categoryTotals, transactionTotals]);

  // Check if the current budget month is a future month to display a different header
  const currentTS = new Date();
  const currentMonth = currentTS.getMonth() + 1;
  const currentYear = currentTS.getFullYear();

  const isFutureMonth =
    dateInfo.year === currentYear && dateInfo.month > currentMonth;

  if (!totals) {
    return (
      <div className="mb-4">
        <ErrorMessage
          message={"There was a problem getting your budget totals"}
        />
      </div>
    );
  } else {
    if (isFutureMonth) {
      return (
        <div className="mb-4">
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex gap-4 mt-3 flex-column flex-lg-row justify-content-between">
                    <div className="d-flex flex-row">
                      <div className="mx-2">
                        <div className="text-muted small">Expected Income</div>
                        <div
                          className={`fw-semibold ${totals.income === 0 ? "text-danger" : "text-dark"}`}
                        >
                          {dollarFormatter(totals.income)}
                        </div>
                      </div>
                      <div className="mx-2">
                        <div className="text-muted small">
                          Expected Fixed Bills
                        </div>
                        <div className="fw-semibold">
                          {dollarFormatter(totals.fixedBudget)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="mt-2">
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className={`progress-bar ${totals.outflowColor}`}
                    style={{ width: `${totals.outflowPercent}%` }}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      );
    } else {
      return (
        <div className="mb-4">
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <h2 className={`fw-bold ${totals.remainingColor}`}>
                    {totals.remainingText}
                  </h2>

                  <div className="d-flex gap-4 mt-3 flex-column flex-lg-row justify-content-between">
                    <div className="d-flex flex-row">
                      <div className="mx-2">
                        <div className="text-muted small">Total Inflow</div>
                        <div
                          className={`fw-semibold ${totals.inflow === 0 ? "text-danger" : "text-dark"}`}
                        >
                          {dollarFormatter(totals.inflow)}
                        </div>
                      </div>
                      <div className="mx-2">
                        <div className="text-muted small">Current Outflow</div>
                        <div className="fw-semibold">
                          {dollarFormatter(totals.outflow)} (
                          <span className={totals.remainingColor}>
                            {totals.outflowPercent}%
                          </span>
                          )
                        </div>
                      </div>
                    </div>
                    <div className="d-none d-md-flex flex-row">
                      <div className="mx-2">
                        <div className="text-muted small">Income</div>
                        <div
                          className={`fw-semibold ${totals.income === 0 ? "text-danger" : "text-dark"}`}
                        >
                          {dollarFormatter(totals.income)}
                        </div>
                      </div>
                      {totals.transfersIn > 0 && (
                        <div className="mx-2">
                          <div className="text-muted small">Transfers In</div>
                          <div className="fw-semibold ${totals.transfersIn">
                            {dollarFormatter(totals.transfersIn)}
                          </div>
                        </div>
                      )}
                      <div className="mx-2">
                        <div className="text-muted small">Saved</div>
                        <div className="fw-semibold">
                          {dollarFormatter(totals.transfersOut)}
                        </div>
                      </div>
                      <div className="mx-2">
                        <div className="text-muted small">Variable Spent</div>
                        <div className="fw-semibold">
                          {dollarFormatter(totals.variableActual)}
                        </div>
                      </div>
                      <div className="mx-2">
                        <div className="text-muted small">Fixed Bills</div>
                        <div className="fw-semibold">
                          {dollarFormatter(totals.fixedBudget)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="mt-2">
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className={`progress-bar ${totals.outflowColor}`}
                    style={{ width: `${totals.outflowPercent}%` }}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      );
    }
  }
};

export default TotalsLayout;
