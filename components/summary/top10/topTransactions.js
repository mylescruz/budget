import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Row } from "react-bootstrap";

const storeColumn = "col-6";
const amountColumn = "col-6 text-end";

const TopTransactions = ({ transactions }) => {
  return (
    <Card.Body>
      <Row className="fw-bold">
        <Col className={storeColumn}>Store</Col>
        <Col className={amountColumn}>Amount</Col>
      </Row>
      {transactions.map((transaction, index) => (
        <Row key={index} className="d-flex my-1">
          <Col className={storeColumn}>
            <span className="fw-bold">{index + 1}.</span>{" "}
            {transaction.store.length > 9
              ? transaction.store.slice(0, 9) + "..."
              : transaction.store}
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
