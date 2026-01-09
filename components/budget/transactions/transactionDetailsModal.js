import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Button, Col, Modal, Row } from "react-bootstrap";

const TransactionDetailsModal = ({ transaction, modal, setModal }) => {
  const closeDetails = () => {
    setModal("none");
  };

  const openDelete = () => {
    setModal("delete");
  };

  const openEdit = () => {
    setModal("edit");
  };

  return (
    <Modal show={modal === "details"} onHide={closeDetails} centered>
      <Modal.Header closeButton>
        <Modal.Title>Transaction Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="m-2">Date: {dateFormatter(transaction.date)}</Row>
        <Row className="m-2">Store: {transaction.store}</Row>
        <Row className="m-2">Items Purchased: {transaction.items}</Row>
        <Row className="m-2">Category: {transaction.category}</Row>
        <Row className="m-2">Amount: {dollarFormatter(transaction.amount)}</Row>
      </Modal.Body>
      <Modal.Footer>
        <Row>
          <Col>
            <Button variant="danger" onClick={openDelete}>
              Delete
            </Button>
          </Col>
          <Col>
            <Button variant="info" onClick={openEdit}>
              Edit
            </Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionDetailsModal;
