import dollarFormatter from "@/helpers/dollarFormatter";
import { useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import IncomeSummaryModal from "./incomeSummaryModal";

const TotalsCards = ({ summary }) => {
  const totals = summary.totals;

  const [modal, setModal] = useState("none");

  const showModal = (modalName) => {
    setModal(modalName);
  };

  const totalSummary = [
    {
      title: "Total Income",
      amount: totals.income,
      modal: "income",
    },
    {
      title: "Total Spent",
      amount: totals.spent,
      modal: "none",
    },
    {
      title: "Total Left",
      amount: totals.remaining,
      modal: "none",
    },
  ];

  const monthsSummary = [
    {
      title: "Highest Spent",
      name: totals.maxMonth.name,
      amount: totals.maxMonth.amount,
    },
    {
      title: "Lowest Spent",
      name: totals.minMonth.name,
      amount: totals.minMonth.amount,
    },
    {
      title: "Average",
      name: "Per Month",
      amount: totals.avgMonth,
    },
  ];

  return (
    <Container>
      <Row className="d-flex align-items-start">
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
      <Row className="d-flex align-items-start">
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

      {modal === "income" && (
        <IncomeSummaryModal
          income={summary.income}
          modal={modal}
          setModal={setModal}
        />
      )}
    </Container>
  );
};

export default TotalsCards;
