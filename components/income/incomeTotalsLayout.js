import dollarFormatter from "@/helpers/dollarFormatter";
import { Row } from "react-bootstrap";
import IncomeTotalsCard from "./incomeTotalsCard";
import { useMemo } from "react";

const IncomeTotalsLayout = ({ incomeTotals }) => {
  const totals = useMemo(
    () => [
      { title: "Total Gross", amount: dollarFormatter(incomeTotals.gross) },
      {
        title: "Total Deductions",
        amount: dollarFormatter(incomeTotals.deductions),
      },
      { title: "Total Net", amount: dollarFormatter(incomeTotals.amount) },
      { title: "# of Sources", amount: incomeTotals.numSources },
    ],
    [incomeTotals],
  );

  return (
    <Row className="text-center col-12 col-xl-10 my-2 mx-auto d-flex justify-content-center">
      {totals.map((total) => (
        <IncomeTotalsCard key={total.title} total={total} />
      ))}
    </Row>
  );
};

export default IncomeTotalsLayout;
