import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";
import dollarFormatter from "@/helpers/dollarFormatter";
import PopUp from "@/components/ui/popUp";
import ProgressBar from "@/components/ui/progressBar";
import addDecimalValues from "@/helpers/addDecimalValues";

const WARNING_PERCENTAGE = 10;

const TotalsLayout = () => {
  const { categoryTotals } = useContext(CategoriesContext);
  const { transactionTotals } = useContext(TransactionsContext);

  // Get the total available funds for the month
  const availableFunds = addDecimalValues(
    categoryTotals.income,
    transactionTotals.checkingTransfers,
  );

  // Get the total amount currently charged for the month
  const currentSpending = addDecimalValues(
    categoryTotals.actual,
    transactionTotals.savingsTransfers,
  );

  // Get the total funds left to spend for the month
  const leftToSpend = centsToDollars(
    dollarsToCents(availableFunds) -
      dollarsToCents(categoryTotals.fixedBudget) -
      dollarsToCents(categoryTotals.variableActual) -
      dollarsToCents(transactionTotals.savingsTransfers),
  );

  // Define the text color of the amount values for the cards
  const availableFundsTextColor =
    availableFunds === 0 ? "text-danger" : "text-white";

  let leftToSpendTextColor;

  const variableSpentPercent = Math.round((leftToSpend / availableFunds) * 100);

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

  return (
    <div className="mb-4">
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
            <h2 className={availableFundsTextColor}>
              {dollarFormatter(availableFunds)}
            </h2>
          </Card>
        </Col>
        <Col className="col-12 col-md-6 my-1">
          <Card className="text-center bg-dark p-3">
            <h5 className="text-white">
              Left to Spend
              <PopUp
                id="leftToSpend"
                title={"Available to spend after all expenses and transfers."}
              >
                <span className="fs-6"> &#9432;</span>
              </PopUp>
            </h5>
            <h2 className={leftToSpendTextColor}>
              {dollarFormatter(leftToSpend)}
            </h2>
          </Card>
        </Col>
      </Row>

      <ProgressBar currentValue={currentSpending} totalValue={availableFunds} />

      <Row className="mt-4 text-center">
        <Col className="col-4 my-1">
          <PopUp
            id="variableSpent"
            title={"Total spent on expense transactions"}
          >
            <div>
              Expenses: {dollarFormatter(categoryTotals.variableActual)}
            </div>
          </PopUp>
        </Col>
        <Col className="col-4 my-1">
          <PopUp
            id="fixedCategories"
            title={"Total obligation for all fixed categories"}
          >
            <div>
              Fixed Bills: {dollarFormatter(categoryTotals.fixedBudget)}
            </div>
          </PopUp>
        </Col>
        <Col className="col-4 my-1">
          <PopUp id="saved" title={"Total transferred out to savings"}>
            <div>
              Saved: {dollarFormatter(transactionTotals.savingsTransfers)}
            </div>
          </PopUp>
        </Col>
      </Row>
    </div>
  );
};

export default TotalsLayout;
