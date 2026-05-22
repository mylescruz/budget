import { Modal } from "react-bootstrap";

const InsightModal = ({ insight, setInsight }) => {
  const closeModal = () => {
    setInsight(null);
  };

  return (
    <Modal show={insight} size={"sm"} onHide={closeModal} centered>
      <Modal.Header
        className="d-flex align-items-center justify-content-center"
        closeButton
      >
        <Modal.Title className="fs-5">{insight.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center text-muted small mt-0 mb-2">
          {insight.description}
        </p>
        {insight.data.map((obj, index) => (
          <div key={index} className="border-bottom py-1">
            <p className="text-muted mb-0">
              {index + 1}. {obj.name}
            </p>
            <h5 className="fw-bold mx-3">{obj.value}</h5>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default InsightModal;
