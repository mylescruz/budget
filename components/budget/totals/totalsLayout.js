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
  const { transactions } = useContext(TransactionsContext);

  // Calculate the money transferred in and out of a user's account
  const transfers = transactions.reduce(
    (sum, current) => {
      if (current.type === "Transfer") {
        if (current.toAccount === "Checking") {
          sum.in += dollarsToCents(current.amount);
        }

        if (current.toAccount === "Savings") {
          sum.out += dollarsToCents(current.amount);
        }
      }

      return sum;
    },
    { in: 0, out: 0 },
  );

  const transfersIn = centsToDollars(transfers.in);
  const transfersOut = centsToDollars(transfers.out);

  // Get the total available funds for the month
  const availableFunds = addDecimalValues(categoryTotals.budget, transfersIn);

  // Get the total funds left to spend for the month
  const leftToSpend = centsToDollars(
    dollarsToCents(availableFunds) -
      dollarsToCents(categoryTotals.fixedBudget) -
      dollarsToCents(categoryTotals.nonFixedActual) -
      dollarsToCents(transfersOut),
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

      <Row className="mb-4 text-center">
        <Col className="col-12 col-md-4 my-1">
          <PopUp
            id="variableSpent"
            title={"Total spent in changing categories"}
          >
            <div>
              Total Spent: {dollarFormatter(categoryTotals.nonFixedActual)}
            </div>
          </PopUp>
        </Col>
        <Col className="col-12 col-md-4 my-1">
          <PopUp id="transfersIn" title={"Total transfers out to savings"}>
            <div>Transferred In: {dollarFormatter(transfersIn)}</div>
          </PopUp>
        </Col>
        <Col className="col-12 col-md-4 my-1">
          <PopUp id="transfersOut" title={"Total transfers out to savings"}>
            <div>Transferred to Savings: {dollarFormatter(transfersOut)}</div>
          </PopUp>
        </Col>
      </Row>

      <ProgressBar
        currentValue={
          categoryTotals.nonFixedActual +
          categoryTotals.fixedActual +
          transfersOut
        }
        totalValue={availableFunds}
      />
    </div>
  );
};

export default TotalsLayout;
