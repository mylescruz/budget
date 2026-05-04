import { useContext, useMemo } from "react";
import { Card, Col, Row } from "react-bootstrap";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";
import dollarFormatter from "@/helpers/dollarFormatter";
import addDecimalValues from "@/helpers/addDecimalValues";
import ErrorMessage from "@/components/ui/errorMessage";
import { BudgetContext } from "@/contexts/BudgetContext";

const WARNING_PERCENTAGE = 0.9;

const TotalsLayout = () => {
  const { categoryTotals, transactionTotals } = useContext(BudgetContext);

  // Object that calculates the budget totals for the current month
  const totals = useMemo(() => {
    if (!categoryTotals || !transactionTotals) {
      return null;
    }

    const income = transactionTotals.income;

    const transfersIn = transactionTotals.checkingTransfers;

    const availableFunds = addDecimalValues(income, transfersIn);

    const currentSpending = addDecimalValues(
      categoryTotals.actual,
      transactionTotals.savingsTransfers,
    );

    const leftToSpend = centsToDollars(
      dollarsToCents(availableFunds) -
        dollarsToCents(categoryTotals.fixedBudget) -
        dollarsToCents(categoryTotals.variableActual) -
        dollarsToCents(transactionTotals.savingsTransfers),
    );

    let leftToSpendTextColor;

    const variableSpentPercent = leftToSpend / availableFunds;

    if (variableSpentPercent <= 0 && leftToSpend <= 0) {
      leftToSpendTextColor = "text-danger";
    } else if (
      variableSpentPercent >= 0 &&
      variableSpentPercent >= WARNING_PERCENTAGE
    ) {
      leftToSpendTextColor = "text-warning";
    } else {
      leftToSpendTextColor = "text-success";
    }

    return {
      income,
      transfersIn,
      availableFunds,
      availableFundsTextColor:
        availableFunds === 0 ? "text-danger" : "text-dark",
      currentSpending,
      leftToSpend,
      leftToSpendTextColor,
      variableActual: categoryTotals.variableActual,
      fixedBudget: categoryTotals.fixedBudget,
      savingsTransfers: transactionTotals.savingsTransfers,
    };
  }, [categoryTotals, transactionTotals]);

  const percentSpent = totals.currentSpending / totals.availableFunds;

  let spentColor;
  let remainingText;
  const isOver = totals.leftToSpend < 0;

  if (percentSpent <= 0 && totals.leftToSpend <= 0) {
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
    <div className="mb-4">
      {totals ? (
        <>
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <h2 className={`fw-bold ${totals.leftToSpendTextColor}`}>
                    {dollarFormatter(totals.leftToSpend)} Remaining
                  </h2>

                  <div className="d-flex gap-4 mt-3 flex-column flex-lg-row justify-content-between">
                    <div className="d-flex flex-row">
                      <div className="mx-2">
                        <div className="text-muted small">Available Funds</div>
                        <div className="fw-semibold">
                          {dollarFormatter(totals.availableFunds)}
                        </div>
                      </div>
                      <div className="mx-2">
                        <div className="text-muted small">Current Expenses</div>
                        <div className="fw-semibold">
                          {dollarFormatter(totals.currentSpending)} (
                          {Math.round(percentSpent * 100)}%)
                        </div>
                      </div>
                    </div>
                    <div className="d-none d-md-flex flex-row">
                      <div className="mx-2">
                        <div className="text-muted small">Income</div>
                        <div
                          className={`fw-semibold ${totals.availableFundsTextColor}`}
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
                          {dollarFormatter(totals.savingsTransfers)}
                        </div>
                      </div>
                      <div className="mx-2">
                        <div className="text-muted small">Expenses</div>
                        <div className="fw-semibold">
                          {dollarFormatter(totals.variableActual)}
                        </div>
                      </div>
                      <div className="mx-2">
                        <div className="text-muted small">Fixed Bils</div>
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
                    className={`progress-bar ${
                      isOver
                        ? "bg-danger"
                        : percentSpent > 90
                          ? "bg-warning"
                          : "bg-success"
                    }`}
                    style={{ width: `${percentSpent * 100}%` }}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      ) : (
        <ErrorMessage
          message={"There was a problem getting your budget totals"}
        />
      )}
    </div>
  );
};

export default TotalsLayout;
