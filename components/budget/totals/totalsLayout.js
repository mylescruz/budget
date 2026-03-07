import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext } from "react";
import { Col } from "react-bootstrap";
import TotalsCard from "./totalsCard";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";

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

  const availableFunds = centsToDollars(
    dollarsToCents(categoryTotals.budget) + transfers.in,
  );

  const leftoverVariableFunds = centsToDollars(
    dollarsToCents(availableFunds) -
      dollarsToCents(categoryTotals.fixedBudget) -
      dollarsToCents(categoryTotals.nonFixedActual) -
      transfers.out,
  );

  // Define the text color of the amount values for the cards
  const variableSpendingPercentage = Math.round(
    (leftoverVariableFunds / availableFunds) * 100,
  );

  let leftoverFundsColor;

  // Show red text if the user has no income or if their available spending balance is less than 0
  if (variableSpendingPercentage <= 0 && leftoverVariableFunds <= 0) {
    leftoverFundsColor = "text-danger";
  } else if (
    variableSpendingPercentage >= 0 &&
    variableSpendingPercentage < WARNING_PERCENTAGE
  ) {
    leftoverFundsColor = "text-warning";
  } else {
    leftoverFundsColor = "text-success";
  }

  const totals = [
    {
      title: "Total Funds",
      amount: availableFunds,
      amountTextColor: availableFunds === 0 ? "text-danger" : "text-white",
      description: "Monthly income plus incoming transfers.",
    },
    {
      title: "Available to Spend",
      amount: leftoverVariableFunds,
      amountTextColor: leftoverFundsColor,
      description: "Available to spend after all expenses and transfers.",
    },
  ];

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between mb-4">
        {totals.map((total) => (
          <Col key={total.title} className="col-12 col-md-5 mb-2">
            <TotalsCard
              title={total.title}
              amount={total.amount}
              amountTextColor={total.amountTextColor}
              description={total.description}
            />
          </Col>
        ))}
      </div>
    </>
  );
};

export default TotalsLayout;
