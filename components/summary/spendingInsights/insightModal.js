import { Col, Modal, Row } from "react-bootstrap";

const InsightModal = ({ insight, showModal, setShowModal }) => {
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{insight.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {insight.data.length === 0 ? (
          <h6 className="fw-bold">{insight.emptyMessage}</h6>
        ) : (
          insight.data.map((obj, index) => (
            <Row key={index} className="d-flex flex-row my-1">
              <Col className="col-8">
                <h5>
                  {index + 1}. {obj.name}
                </h5>
              </Col>
              <Col className="col-4 text-end">
                <h6>{obj.value}</h6>
              </Col>
            </Row>
          ))
        )}
      </Modal.Body>
    </Modal>
  );
};

export default InsightModal;
