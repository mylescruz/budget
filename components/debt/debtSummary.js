import { Row } from "react-bootstrap";
import DebtSummaryCard from "./debtSummaryCard";

const DebtSummary = ({ debts }) => {
  // Calculate the totals for all debts
  const totals = debts.reduce(
    (sum, debt) => {
      sum.debts += debt.currentBalance;
      sum.minimums += debt.minimumPayment;
      sum.accounts += 1;
      sum.apr += debt.apr;

      return sum;
    },
    { accounts: 0, debts: 0, minimums: 0, apr: 0 },
  );

  // Calculate the average APR between all debts
  const averageAPR = Math.round(totals.apr / totals.accounts);
  const averageAPRText = averageAPR ? `${averageAPR}%` : "N/A";

  return (
    <Row className="g-3 mb-4">
      <DebtSummaryCard
        title="Total Debt"
        amount={totals.debts}
        icon="bi-cash-stack"
        textColor={totals.debts > 0 ? "text-danger" : "text-success"}
      />

      <DebtSummaryCard
        title="Monthly Minimums"
        amount={totals.minimums}
        icon="bi-calendar-check"
      />

      <DebtSummaryCard
        title="Average APR"
        amount={averageAPRText}
        icon="bi-percent"
      />

      <DebtSummaryCard
        title="Active Accounts"
        amount={totals.accounts.toString()}
        icon="bi-credit-card"
      />
    </Row>
  );
};

export default DebtSummary;
