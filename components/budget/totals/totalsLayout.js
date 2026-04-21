import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext, useMemo } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";
import dollarFormatter from "@/helpers/dollarFormatter";
import PopUp from "@/components/ui/popUp";
import ProgressBar from "@/components/ui/progressBar";
import addDecimalValues from "@/helpers/addDecimalValues";
import ErrorMessage from "@/components/ui/errorMessage";

const WARNING_PERCENTAGE = 10;

const TotalsLayout = () => {
  const { categoryTotals } = useContext(CategoriesContext);
  const { transactionTotals } = useContext(TransactionsContext);

  // Object that calculates the budget totals for the current month
  const totals = useMemo(() => {
    if (!categoryTotals || !transactionTotals) {
      return null;
    }

    const availableFunds = addDecimalValues(
      transactionTotals.income,
      transactionTotals.checkingTransfers,
    );

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

    const variableSpentPercent = Math.round(
      (leftToSpend / availableFunds) * 100,
    );

    if (variableSpentPercent <= 0 && leftToSpend <= 0) {
      leftToSpendTextColor = "text-danger";
    } else if (
      variableSpentPercent >= 0 &&
      variableSpentPercent < WARNING_PERCENTAGE
    ) {
      leftToSpendTextColor = "text-warning";
    } else {
      leftToSpendTextColor = "text-success";
    }

    return {
      availableFunds,
      availableFundsTextColor:
        availableFunds === 0 ? "text-danger" : "text-white",
      currentSpending,
      leftToSpend,
      leftToSpendTextColor,
      variableActual: categoryTotals.variableActual,
      fixedBudget: categoryTotals.fixedBudget,
      savingsTransfers: transactionTotals.savingsTransfers,
    };
  }, [categoryTotals, transactionTotals]);

  return (
    <div className="mb-4">
      {totals ? (
        <>
          <Row className="mb-3">
            <Col className="col-12 col-md-6 my-1">
              <Card className="text-center bg-dark text-white p-3">
                <h5>
                  Available Funds{" "}
                  <PopUp
                    id="availableFunds"
                    title={"Monthly income plus incoming transfers."}
                  >
                    <span className="fs-6"> &#9432;</span>
                  </PopUp>
                </h5>
                <h2 className={totals.availableFundsTextColor}>
                  {dollarFormatter(totals.availableFunds)}
                </h2>
              </Card>
            </Col>
            <Col className="col-12 col-md-6 my-1">
              <Card className="text-center bg-dark p-3">
                <h5 className="text-white">
                  Left to Spend
                  <PopUp
                    id="leftToSpend"
                    title={
                      "Available to spend after all expenses and transfers."
                    }
                  >
                    <span className="fs-6"> &#9432;</span>
                  </PopUp>
                </h5>
                <h2 className={totals.leftToSpendTextColor}>
                  {dollarFormatter(totals.leftToSpend)}
                </h2>
              </Card>
            </Col>
          </Row>

          <ProgressBar
            currentValue={totals.currentSpending}
            totalValue={totals.availableFunds}
          />

          <Row className="mt-4 text-center">
            <Col className="col-4 my-1">
              <PopUp
                id="variableSpent"
                title={"Total spent on expense transactions"}
              >
                <div>Expenses: {dollarFormatter(totals.variableActual)}</div>
              </PopUp>
            </Col>
            <Col className="col-4 my-1">
              <PopUp
                id="fixedCategories"
                title={"Total obligation for all fixed categories"}
              >
                <div>Fixed Bills: {dollarFormatter(totals.fixedBudget)}</div>
              </PopUp>
            </Col>
            <Col className="col-4 my-1">
              <PopUp id="saved" title={"Total transferred out to savings"}>
                <div>Saved: {dollarFormatter(totals.savingsTransfers)}</div>
              </PopUp>
            </Col>
          </Row>
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
