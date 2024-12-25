import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { Button, Col, Modal, Row } from "react-bootstrap";

const PaystubDetails = ({ paystub, showDetails, setShowDetails }) => {
    const closeDetails = () => {
        setShowDetails(false);
    };

    return (
        <Modal show={showDetails} onHide={closeDetails} centered>
            <Modal.Header closeButton>
                <Modal.Title>Paystub Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="m-2">Date: {dateFormatter(paystub.date)}</Row>
                <Row className="m-2">Company: {paystub.company}</Row>
                <Row className="m-2">Net Pay: {currencyFormatter.format(paystub.net)}</Row>
                <Row className="m-2">Taxes: {currencyFormatter.format(paystub.taxes)}</Row>
                <Row className="m-2">Gross Pay: {currencyFormatter.format(paystub.gross)}</Row>
            </Modal.Body> 
            <Modal.Footer>
                <Row>
                    <Col><Button variant="danger">Delete</Button></Col>
                    <Col><Button variant="info">Edit</Button></Col>
                </Row>
            </Modal.Footer>
        </Modal>
    );
};

export default PaystubDetails;