import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const TopTransactions = ({ transactions }) => {
  return (
    <Card.Body>
      <h4 className="text-center">Transactions of the Year</h4>
      <Row className="fw-bold">
        <Col>Store</Col>
        <Col className="text-end">Amount</Col>
      </Row>
      {transactions.map((transaction) => (
        <Row className="d-flex my-1">
          <Col className="col-8 col-md-3">
            <span className="d-lg-none">
              {transaction.store.length > 15
                ? transaction.store.slice(0, 15) + "..."
                : transaction.store}
            </span>
            <span className="d-none d-lg-block d-xl-none">
              {transaction.store.length > 35
                ? transaction.store.slice(0, 35) + "..."
                : transaction.store}
            </span>
            <span className="d-none d-xl-block">
              {transaction.store.length > 40
                ? transaction.store.slice(0, 40) + "..."
                : transaction.store}
            </span>
          </Col>
          <Col className="d-none d-md-block col-md-6">
            <span className="d-none d-md-block d-lg-none">
              {transaction.items.length > 35
                ? transaction.items.slice(0, 35) + "..."
                : transaction.items}
            </span>
            <span className="d-none d-lg-block d-xl-none">
              {transaction.items.length > 45
                ? transaction.items.slice(0, 45) + "..."
                : transaction.items}
            </span>
            <span className="d-none d-xl-block">
              {transaction.items.length > 50
                ? transaction.items.slice(0, 50) + "..."
                : transaction.items}
            </span>
          </Col>
          <Col className="col-4 col-md-3 text-end">
            {dollarFormatter(transaction.amount)}
          </Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopTransactions;
