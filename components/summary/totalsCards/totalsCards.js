import dollarFormatter from "@/helpers/dollarFormatter";
import { useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import IncomeSummaryModal from "./incomeSummaryModal";
import MonthsSpendingModal from "./monthsSpendingModal";
import RemainingSummaryModal from "./remainingSummaryModal";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";

const TotalsCards = ({ summary }) => {
  const [modal, setModal] = useState("none");

  const showModal = (modalName) => {
    setModal(modalName);
  };

  // Define income summaries
  const income = summary.income;
  const totalIncome = income.totalIncome.amount;

  // Define spending summaries
  const numMonths = summary.months.length;
  const sortedMonthsBySpending = summary.months.sort(
    (a, b) => b.actual - a.actual,
  );
  const highestSpentMonth = sortedMonthsBySpending[0];
  const lowestSpentMonth = sortedMonthsBySpending[numMonths - 1];

  const sortedMonths = summary.months.sort((a, b) => a.number - b.number);

  const totalSpent = centsToDollars(
    summary.months.reduce(
      (sum, current) => sum + dollarsToCents(current.actual),
      0,
    ),
  );
  const averageSpentPerMonth = totalSpent / numMonths;

  const totalRemaining = subtractDecimalValues(
    income.totalIncome.amount,
    totalSpent,
  );

  const totalSummary = [
    {
      title: "Total Income",
      amount: totalIncome,
      modal: "income",
    },
    {
      title: "Total Spent",
      amount: totalSpent,
      modal: "spent",
    },
    {
      title: "Total Left",
      amount: totalRemaining,
      modal: "remaining",
    },
  ];

  const monthsSummary = [
    {
      title: "Highest Spent",
      name: highestSpentMonth.name,
      amount: highestSpentMonth.actual,
    },
    {
      title: "Lowest Spent",
      name: lowestSpentMonth.name,
      amount: lowestSpentMonth.actual,
    },
    {
      title: "Average",
      name: "Per Month",
      amount: averageSpentPerMonth,
    },
  ];

  return (
    <>
      <Row className="d-flex justify-content-center">
        {totalSummary.map((total, index) => (
          <Col key={index} className="col-12 col-md-4">
            <Card className="my-2 card-background">
              <Card.Body>
                <h4 className="fw-bold">{total.title}</h4>
                <h5>
                  <span
                    className={`${
                      total.amount < 0 ? "text-danger fw-bold" : ""
                    }`}
                  >
                    {dollarFormatter(total.amount)}
                  </span>
                </h5>
                <p
                  className="text-center text-decoration-underline clicker m-0"
                  onClick={() => {
                    showModal(total.modal);
                  }}
                >
                  Details
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="d-flex justify-content-center">
        {monthsSummary.map((month, index) => (
          <Col key={index} className="col-12 col-md-4">
            <Card className="my-2 card-background">
              <Card.Body>
                <h4 className="fw-bold">{month.title}</h4>
                <h5>{month.name}</h5>
                <h5>{dollarFormatter(month.amount)}</h5>
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
        months={sortedMonths}
        totalSpent={totalSpent}
        modal={modal}
        setModal={setModal}
      />

      <RemainingSummaryModal
        months={sortedMonths}
        totalRemaining={totalRemaining}
        modal={modal}
        setModal={setModal}
      />
    </>
  );
};

export default TotalsCards;
