import { Col, Modal, Row } from "react-bootstrap";

const InsightModal = ({ insight, setInsight }) => {
  const closeModal = () => {
    setInsight(null);
  };

  return (
    <Modal show={insight} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{insight.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="text-muted small m-0">{insight.description}</p>
        {insight.data.map((obj, index) => (
          <div key={index} className="my-1">
            <p className="fw-bold mb-0">{obj.name}</p>
            <h6 className="text-muted">{obj.value}</h6>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default InsightModal;
