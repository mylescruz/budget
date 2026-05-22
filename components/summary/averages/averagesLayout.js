import { Row } from "react-bootstrap";
import AveragesCards from "./averagesCards";

const AveragesLayout = ({ totals }) => {
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
