import { Card, Col, Row } from "react-bootstrap";
import styles from "@/styles/summary/spendingInsights/insightCards.module.css";
import InsightModal from "./insightModal";
import { useState } from "react";

const InsightCard = ({ insight }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Col className="col-12 col-md-6 col-lg-4">
        <Card className={`mb-4 card-background ${styles.insightCard}`}>
          <Card.Body className="text-center d-flex flex-column justify-content-between">
            <div>
              <h4 className="fw-bold">{insight.title}</h4>
            </div>
            <div className="flex-fill">
              {insight.data.length === 0 ? (
                <h6 className="fw-bold">{insight.emptyMessage}</h6>
              ) : (
                insight.data.slice(0, 3).map((obj, index) => (
                  <Row key={index} className="d-flex my-1">
                    <h5 className="fw-bold">
                      <i className={`fs-6 bi bi-${index + 1}-square`} />{" "}
                      {obj.name}
                    </h5>
                    <h6>{obj.value}</h6>
                  </Row>
                ))
              )}
            </div>
            <div>
              <p
                className="text-center text-decoration-underline align-self-end clicker m-0"
                onClick={() => {
                  setShowModal(true);
                }}
              >
                Details
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <InsightModal
        insight={insight}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};

export default InsightCard;
