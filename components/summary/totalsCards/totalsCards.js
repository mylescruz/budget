import dollarFormatter from "@/helpers/dollarFormatter";
import { useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import IncomeSummaryModal from "./incomeSummaryModal";
import MonthsSpendingModal from "./monthsSpendingModal";
import RemainingSummaryModal from "./remainingSummaryModal";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";

const TotalsCards = ({ summary }) => {
  const [modal, setModal] = useState("none");

  const showModal = (modalName) => {
    setModal(modalName);
  };

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
  };

  const totalsArray = [
    {
      title: "Income",
      amount: totals.income,
      textColor: "text-dark",
      modal: "income",
    },
    {
      title: "Expenses",
      amount: totals.expenses,
      textColor: "text-dark",
      modal: "spent",
    },
    {
      title: "Net Cash Flow",
      amount: totals.netCashFlow,
      textColor:
        totals.netCashFlow >= 0
          ? "text-success fw-bold"
          : "text-danger fw-bold",
      modal: "remaining",
    },
    {
      title: "Saved",
      amount: totals.toSavings,
      textColor:
        totals.toSavings > 0 ? "text-success fw-bold" : "text-danger fw-bold",
    },
    {
      title: "Transfers In",
      amount: totals.toChecking,
      textColor:
        totals.toChecking > 0 ? "text-danger fw-bold" : "text-success fw-bold",
    },
    {
      title: "Net Savings",
      amount: totals.netSavings,
      textColor:
        totals.netSavings >= 0 ? "text-success fw-bold" : "text-danger fw-bold",
    },
  ];

  return (
    <>
      <Row className="d-flex justify-content-center">
        {totalsArray.map((total, index) => (
          <Col key={index} className="col-12 col-md-4">
            <Card className="my-2 card-background">
              <Card.Body>
                <h5 className="fw-bold">{total.title}</h5>
                <h4>
                  <span className={total.textColor}>
                    {dollarFormatter(total.amount)}
                  </span>
                </h4>
                {total.modal && (
                  <p
                    className="text-center text-decoration-underline clicker m-0"
                    onClick={() => {
                      showModal(total.modal);
                    }}
                  >
                    Details
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <IncomeSummaryModal
        income={summary.income}
        modal={modal}
        setModal={setModal}
      />

      <MonthsSpendingModal
        months={summary.months}
        totalExpenses={totals.expenses}
        modal={modal}
        setModal={setModal}
      />

      <RemainingSummaryModal
        months={summary.months}
        totalRemaining={totals.netCashFlow}
        modal={modal}
        setModal={setModal}
      />
    </>
  );
};

export default TotalsCards;
