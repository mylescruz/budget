import { Card, Col, Row } from "react-bootstrap";
import styles from "@/styles/summary/spendingInsights/insightCards.module.css";

const InsightCard = ({ insight }) => {
  return (
    <Col className="col-12 col-md-6 col-lg-4">
      <Card className={`mb-4 card-background ${styles.insightCard}`}>
        <Card.Body className="text-center">
          <h4 className="fw-bold">{insight.title}</h4>
          {insight.data.length === 0 ? (
            <h6 className="fw-bold">{insight.emptyMessage}</h6>
          ) : (
            insight.data.map((obj, index) => (
              <Row key={index} className="d-flex my-1">
                <h5 className="fw-bold">
                  <i className={`fs-6 bi bi-${index + 1}-square`} /> {obj.name}
                </h5>
                <h6>{obj.value}</h6>
              </Row>
            ))
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default InsightCard;
