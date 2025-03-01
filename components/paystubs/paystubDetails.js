import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { Button, Col, Modal, Row } from "react-bootstrap";

const PaystubDetails = ({ paystub, showDetails, setShowDetails, setShowEdit, setShowDelete }) => {
    const closeDetails = () => {
        setShowDetails(false);
    };

    const openEdit = () => {
        setShowDetails(false);
        setShowEdit(true);
    };

    const openDelete = () => {
        setShowDetails(false);
        setShowDelete(true);
    };

    return (
        <Modal show={showDetails} onHide={closeDetails} centered>
            <Modal.Header closeButton>
                <Modal.Title>Paystub Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="m-2">Date: {dateFormatter(paystub.date)}</Row>
                <Row className="m-2">Company: {paystub.company}</Row>
                <Row className="m-2">Description: {paystub.description}</Row>
                <Row className="m-2">Gross Income: {currencyFormatter.format(paystub.gross)}</Row>
                <Row className="m-2">Taxes: {currencyFormatter.format(paystub.taxes)}</Row>
                <Row className="m-2">Net Income: {currencyFormatter.format(paystub.net)}</Row>
            </Modal.Body> 
            <Modal.Footer>
                <Row>
                    <Col><Button variant="danger" onClick={openDelete}>Delete</Button></Col>
                    <Col><Button variant="info" onClick={openEdit}>Edit</Button></Col>
                </Row>
            </Modal.Footer>
        </Modal>
    );
};

export default PaystubDetails;