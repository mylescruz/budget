import addDecimalValues from "@/helpers/addDecimalValues";
import dollarFormatter from "@/helpers/dollarFormatter";
import { useMemo } from "react";
import { Card, Col, Row } from "react-bootstrap";

const storeColumn = "col-6";
const amountColumn = "col-6 text-end";

const TopTransactionsCards = ({ transactions }) => {
  const transactionInsights = useMemo(() => {
    const topTransactions = [...transactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const storesMap = new Map();

    transactions.forEach((transaction) => {
      const store = storesMap.get(transaction.store);

      if (!store) {
        storesMap.set(transaction.store, {
          store: transaction.store,
          amount: transaction.amount,
          visits: 1,
        });
      } else {
        const totalSpent = addDecimalValues(store.amount, transaction.amount);
        storesMap.set(transaction.store, {
          store: transaction.store,
          amount: totalSpent,
          visits: store.visits + 1,
        });
      }
    });

    const stores = [...storesMap.values()];

    const topStoresShopped = [...stores]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const topStoresVisited = [...stores]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 3);

    return {
      topTransactions,
      topStoresShopped,
      topStoresVisited,
    };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card className="card-background mb-4 top-10-card">
        <Card.Body>
          <h4 className="text-center"></h4>
          <Row className="fw-bold text-center">
            You somehow didn't buy anything this year! That's incredible!
          </Row>
        </Card.Body>
      </Card>
    );
  } else {
    return (
      <Row>
        <Col className="col-12 col-md-6 col-lg-4">
          <Card className="card-background mb-4 top-10-card">
            <Card.Body>
              <h4 className="fw-bold text-center">Biggest Purchases</h4>
              <Row className="fw-bold">
                <Col className={storeColumn}>Store</Col>
                <Col className={amountColumn}>Amount</Col>
              </Row>
              {transactionInsights.topTransactions.map((transaction, index) => (
                <Row key={transaction._id} className="d-flex my-1">
                  <Col className={storeColumn}>
                    <span className="fw-bold">{index + 1}.</span>{" "}
                    {transaction.store.length > 15
                      ? transaction.store.slice(0, 15) + "..."
                      : transaction.store}
                  </Col>
                  <Col className={amountColumn}>
                    {dollarFormatter(transaction.amount)}
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col className="col-12 col-md-6 col-lg-4">
          <Card className="card-background mb-4 top-10-card">
            <Card.Body>
              <h4 className="fw-bold text-center">Top Stores Shopped At</h4>
              <Row className="fw-bold">
                <Col className={storeColumn}>Store</Col>
                <Col className={amountColumn}>Total Amount</Col>
              </Row>
              {transactionInsights.topStoresShopped.map(
                (transaction, index) => (
                  <Row key={transaction._id} className="d-flex my-1">
                    <Col className={storeColumn}>
                      <span className="fw-bold">{index + 1}.</span>{" "}
                      {transaction.store.length > 15
                        ? transaction.store.slice(0, 15) + "..."
                        : transaction.store}
                    </Col>
                    <Col className={amountColumn}>
                      {dollarFormatter(transaction.amount)}
                    </Col>
                  </Row>
                )
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col className="col-12 col-md-6 col-lg-4">
          <Card className="card-background mb-4 top-10-card">
            <Card.Body>
              <h4 className="fw-bold text-center">Top Stores Visited</h4>
              <Row className="fw-bold">
                <Col className={storeColumn}>Store</Col>
                <Col className={amountColumn}>Visits</Col>
              </Row>
              {transactionInsights.topStoresVisited.map(
                (transaction, index) => (
                  <Row key={transaction._id} className="d-flex my-1">
                    <Col className={storeColumn}>
                      <span className="fw-bold">{index + 1}.</span>{" "}
                      {transaction.store.length > 15
                        ? transaction.store.slice(0, 15) + "..."
                        : transaction.store}
                    </Col>
                    <Col className={amountColumn}>{transaction.visits}</Col>
                  </Row>
                )
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }
};

export default TopTransactionsCards;
