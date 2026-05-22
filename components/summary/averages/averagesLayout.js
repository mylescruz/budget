import centsToDollars from "@/helpers/centsToDollars";
import { Row } from "react-bootstrap";
import AveragesCards from "./averagesCards";
import dollarsToCents from "@/helpers/dollarsToCents";

const AveragesLayout = ({ summary }) => {
  // Get the totals for income, expenses and transfers
  const rawTotals = summary.months.reduce(
    (sum, month) => {
      sum.income += dollarsToCents(month.income);

      sum.expenses += dollarsToCents(month.actual);

      sum.transfers.in += dollarsToCents(month.transfers.in);

      sum.transfers.out += dollarsToCents(month.transfers.out);

      return sum;
    },
    { income: 0, expenses: 0, transfers: { in: 0, out: 0 } },
  );

  // Get the net cash flow for the year
  const netCashFlow = rawTotals.income - rawTotals.expenses;

  // Get the net savings for the year
  const netSavings = rawTotals.transfers.out - rawTotals.transfers.in;

  const totals = {
    income: centsToDollars(rawTotals.income),
    expenses: centsToDollars(rawTotals.expenses),
    netCashFlow: centsToDollars(netCashFlow),
    toSavings: centsToDollars(rawTotals.transfers.out),
    toChecking: centsToDollars(rawTotals.transfers.in),
    netSavings: centsToDollars(netSavings),
    numMonths: summary.months.length,
  };

  const averages = [
    {
      title: "Avg Income Per Month",
      amount: totals.income / totals.numMonths,
      textColor: "text-dark",
    },
    {
      title: "Avg Expenses Per Month",
      amount: totals.expenses / totals.numMonths,
      textColor: "text-dark",
    },
    {
      title: "Avg Net Per Month",
      amount: totals.netCashFlow / totals.numMonths,
      textColor:
        totals.netCashFlow >= 0
          ? "text-success fw-bold"
          : "text-danger fw-bold",
    },
    {
      title: "Avg Saved Per Month",
      amount: totals.toSavings / totals.numMonths,
      textColor:
        totals.toSavings > 0 ? "text-success fw-bold" : "text-danger fw-bold",
    },
    {
      title: "Avg Transfers In Per Month",
      amount: totals.toChecking / totals.numMonths,
      textColor:
        totals.toChecking > 0 ? "text-danger fw-bold" : "text-success fw-bold",
    },
    {
      title: "Avg Net Savings Per Month",
      amount: totals.netSavings / totals.numMonths,
      textColor:
        totals.netSavings >= 0 ? "text-success fw-bold" : "text-danger fw-bold",
    },
  ];

  return (
    <div className="my-4">
      <h5 className="fw-bold">Averages</h5>
      <Row className="d-flex justify-content-center">
        {averages.map((total, index) => (
          <AveragesCards key={index} total={total} />
        ))}
      </Row>
    </div>
  );
};

export default AveragesLayout;
