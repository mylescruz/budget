import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const storeColumn = "col-8 col-md-4";
const itemsColumn = "d-none d-md-block col-md-6";
const amountColumn = "col-4 col-md-2 text-end";

const TopTransactions = ({ transactions }) => {
  return (
    <Card.Body>
      <Row className="fw-bold">
        <Col className={storeColumn}>Store</Col>
        <Col className={itemsColumn}>Items Purchased</Col>
        <Col className={amountColumn}>Amount</Col>
      </Row>
      {transactions.map((transaction, index) => (
        <Row key={index} className="d-flex my-1">
          <Col className={storeColumn}>
            <span className="fw-bold">{index + 1}.</span> {transaction.store}
          </Col>
          <Col className={itemsColumn}>
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
          <Col className={amountColumn}>
            {dollarFormatter(transaction.amount)}
          </Col>
        </Row>
      ))}
    </Card.Body>
  );
};

export default TopTransactions;
