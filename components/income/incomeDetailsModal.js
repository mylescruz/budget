import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { INCOME_SOURCES } from "@/lib/constants/income";
import { Button, Modal, Row } from "react-bootstrap";

const IncomeDetailsModal = ({ chosenSource, modal, setModal }) => {
  const closeDetailsModal = () => {
    setModal("none");
  };

  const openEditModal = () => {
    setModal("editIncome");
  };

  const openDeleteModal = () => {
    setModal("deleteIncome");
  };

  return (
    <Modal show={modal === "incomeDetails"} onHide={closeDetailsModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{chosenSource.type} Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="m-2">Date: {dateFormatter(chosenSource.date)}</Row>
        {chosenSource.type === INCOME_SOURCES.PAYCHECK && (
          <>
            <Row className="m-2">Company: {chosenSource.name}</Row>
            <Row className="m-2">Description: {chosenSource.description}</Row>
            <Row className="m-2">
              Gross Income: {dollarFormatter(chosenSource.gross)}
            </Row>
            <Row className="m-2">
              Deductions: {dollarFormatter(chosenSource.deductions)}
            </Row>
            <Row className="m-2">
              Net Income: {dollarFormatter(chosenSource.amount)}
            </Row>
          </>
        )}
        {chosenSource.type === INCOME_SOURCES.SALE && (
          <>
            <Row className="m-2">Item Sold: {chosenSource.name}</Row>
            <Row className="m-2">Description: {chosenSource.description}</Row>
            <Row className="m-2">
              Sale Amount: {dollarFormatter(chosenSource.amount)}
            </Row>
          </>
        )}
        {chosenSource.type === INCOME_SOURCES.GIFT && (
          <>
            <Row className="m-2">Received Gift From: {chosenSource.name}</Row>
            <Row className="m-2">Description: {chosenSource.description}</Row>
            <Row className="m-2">
              Gift Amount: {dollarFormatter(chosenSource.amount)}
            </Row>
          </>
        )}
        {chosenSource.type === INCOME_SOURCES.UNEMPLOYMENT && (
          <>
            <Row className="m-2">Received Unemployment from EDD</Row>
            <Row className="m-2">Description: {chosenSource.description}</Row>
            <Row className="m-2">
              Payout Amount: {dollarFormatter(chosenSource.amount)}
            </Row>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="danger" onClick={openDeleteModal}>
          Delete
        </Button>
        <Button variant="info" onClick={openEditModal}>
          Edit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IncomeDetailsModal;
