import { Spinner } from "react-bootstrap";

export default function LoadingIndicator({ message }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center loading-spinner">
      <Spinner animation="border" variant="primary" />
      <p className="text-center mt-4 fs-6">{message}</p>
    </div>
  );
}
