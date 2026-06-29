import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { DEBT_TYPE } from "@/lib/constants/debt";
import { Badge, Card, Col, Row } from "react-bootstrap";

const InactiveDebtCard = ({ debt }) => {
  return (
    <Card className="border-success h-100">
      <Card.Body>
        <Row className="d-flex">
          <Col
            xs={12}
            md={6}
            lg={4}
            className="d-flex flex-row align-items-center"
          >
            <h6 className="mx-1 my-0">{debt.lender}</h6>

            <Badge bg="success" className="mx-1">
              {debt.type === DEBT_TYPE.LOAN ? debt.loanType : "Credit Card"}
            </Badge>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <small className="text-muted">
              Original Balance: {dollarFormatter(debt.originalBalance)}
            </small>

            <div className="fw-bold"></div>
          </Col>

          <Col xs={12} md={6} lg={2}>
            <small className="text-muted">
              Start Date: {dateFormatter(debt.startDate)}
            </small>

            <div className="fw-bold"></div>
          </Col>

          <Col xs={12} md={6} lg={2}>
            <small className="text-muted">
              Paid Off: {dateFormatter(debt.paidOffDate)}
            </small>

            <div className="fw-bold"></div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default InactiveDebtCard;
