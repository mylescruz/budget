import { Button, Modal, Row } from "react-bootstrap";
import ErrorMessage from "./errorMessage";

const ErrorModal = ({ errorOccurred, setErrorOccurred }) => {
  const closeErrorModal = () => {
    setErrorOccurred(false);
  };

  return (
    <Modal show={errorOccurred} onHide={closeErrorModal} centered>
      <Modal.Body>
        <ErrorMessage />
      </Modal.Body>
      <Modal.Footer>
        <Row className="text-end">
          <Button variant="secondary" onClick={closeErrorModal}>
            Close
          </Button>
        </Row>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
