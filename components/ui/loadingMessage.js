import { Modal, Spinner } from "react-bootstrap";

export default function LoadingMessage({ message }) {
  return (
    <Modal.Body>
      <h3 className="text-center">{message}</h3>
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    </Modal.Body>
  );
}
