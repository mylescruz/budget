import { Col, Row } from "react-bootstrap";
import InsightModal from "./insightModal";
import { useState } from "react";

const InsightCard = ({ insight }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Col xs={12} md={6} lg={4}>
        <div className="bg-white rounded-3 shadow-sm p-3 mb-3 text-start">
          <div className="d-flex flex-column justify-content-between text-center">
            <div>
              <h6 className="text-muted">{insight.title}</h6>
            </div>
            {insight.data.length === 0 ? (
              <div className="flex-fill">
                <h6 className="fw-bold small">{insight.emptyMessage}</h6>
              </div>
            ) : (
              <div className="flex-fill">
                {insight.data.slice(0, 1).map((obj, index) => (
                  <Row key={index} className="d-flex my-1">
                    <h4 className="fw-bold">{obj.name}</h4>
                    <h5 className="">{obj.value}</h5>
                  </Row>
                ))}
                <p
                  className="clicker small m-0"
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  Top 10 <i className="bi bi-arrow-right small" />
                </p>
              </div>
            )}
          </div>
        </div>
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
