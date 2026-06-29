import calculateMonthsRemaining from "@/helpers/calculateMonthsRemaining";
import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import formatTimeAgo from "@/helpers/formatTimeAgo";
import { DEBT_TYPE } from "@/lib/constants/debt";
import { Badge, Card, Col, Dropdown, Row } from "react-bootstrap";

const DebtCard = ({ debt, setSelectedDebt, setModal }) => {
  const openEditModal = () => {
    const formattedDebt = { ...debt };

    if (formattedDebt.type === DEBT_TYPE.LOAN) {
      formattedDebt.startDate = new Date(debt.startDate)
        .toISOString()
        .split("T")[0];
      formattedDebt.targetPayoffDate = new Date(debt.targetPayoffDate)
        .toISOString()
        .split("T")[0];
    }

    setSelectedDebt(formattedDebt);

    setModal("EDIT");
  };

  const openPaidOff = () => {
    setSelectedDebt(debt);

    setModal("PAID OFF");
  };

  const openDeleteModal = () => {
    setSelectedDebt(debt);

    setModal("DELETE");
  };

  let remainingPercent;

  if (debt.type === DEBT_TYPE.LOAN) {
    remainingPercent = Math.round(
      (debt.currentBalance / debt.originalBalance) * 100,
    );
  } else {
    remainingPercent = Math.round(
      (debt.currentBalance / debt.creditLimit) * 100,
    );
  }

  const percentPaid = 100 - remainingPercent;

  const monthsRemaining = calculateMonthsRemaining(
    debt.currentBalance,
    debt.apr,
    debt.monthlyPayment,
  );

  const utilization = DEBT_TYPE.CREDIT_CARD ? percentPaid : null;

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <h5 className="mb-1">{debt.lender}</h5>

            <Badge bg={debt.type === DEBT_TYPE.LOAN ? "primary" : "success"}>
              {debt.type === DEBT_TYPE.LOAN
                ? debt.loanType
                : DEBT_TYPE.CREDIT_CARD}
            </Badge>
          </div>

          <Dropdown>
            <Dropdown.Toggle variant="light" size="sm">
              <i className="bi bi-three-dots-vertical" />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={openEditModal}>Edit</Dropdown.Item>
              <Dropdown.Item className="text-success" onClick={openPaidOff}>
                Mark Paid Off
              </Dropdown.Item>
              <Dropdown.Item className="text-danger" onClick={openDeleteModal}>
                Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Row className="g-3 mb-3">
          <Col xs={6}>
            <small className="text-muted">Current Balance</small>
            <div className="fw-bold fs-5">
              {dollarFormatter(debt.currentBalance)}
            </div>
          </Col>

          <Col xs={6}>
            <small className="text-muted">
              {debt.type === DEBT_TYPE.LOAN
                ? "Original Balance"
                : "Credit Limit"}
            </small>

            <div className="fw-bold">
              {debt.type === DEBT_TYPE.LOAN
                ? dollarFormatter(debt.originalBalance)
                : dollarFormatter(debt.creditLimit)}
            </div>
          </Col>

          <Col xs={6}>
            <small className="text-muted">APR</small>
            <div className="fw-bold">{debt.apr}%</div>
          </Col>

          <Col xs={6}>
            <small className="text-muted">Monthly Payment</small>
            <div className="fw-bold">
              {dollarFormatter(debt.monthlyPayment)}
            </div>
          </Col>

          <Col xs={6}>
            <small className="text-muted">Progress</small>
            <div className="fw-bold">
              {debt.type === DEBT_TYPE.LOAN
                ? `${Math.round(percentPaid)}% Paid Off`
                : `${utilization}% Utilization`}
            </div>
          </Col>

          <Col xs={6}>
            <small className="text-muted">Payoff Time</small>
            <div className="fw-bold">{monthsRemaining}</div>
          </Col>
        </Row>

        <div className="mt-2">
          <div className="progress" style={{ height: 6 }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>

        <div className="mt-2 small">
          Balance last updated {formatTimeAgo(debt.balanceLastUpdatedTS)}
        </div>
      </Card.Body>
    </Card>
  );
};

export default DebtCard;
