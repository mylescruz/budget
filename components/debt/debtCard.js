import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { DEBT_TYPE } from "@/lib/constants/debt";
import { Badge, Card, Col, Dropdown, ProgressBar, Row } from "react-bootstrap";

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

  const openDeleteModal = () => {
    setSelectedDebt(debt);

    setModal("DELETE");
  };

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
              <Dropdown.Item className="text-danger" onClick={openDeleteModal}>
                Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Row className="g-3 mb-3">
          <Col xs={6}>
            <small className="text-muted">Balance</small>
            <div className="fw-bold">
              {dollarFormatter(debt.currentBalance)}
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
            <small className="text-muted">Payoff Goal</small>
            <div className="fw-bold">
              {dateFormatter(debt.targetPayoffDate)}
            </div>
          </Col>
        </Row>

        <ProgressBar now={40} />
      </Card.Body>
    </Card>
  );
};

export default DebtCard;
