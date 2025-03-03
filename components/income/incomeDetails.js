import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { Button, Col, Modal, Row } from "react-bootstrap";

const IncomeDetails = ({ paycheck, showDetails, setShowDetails, setShowEdit, setShowDelete }) => {
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
                <Modal.Title>Paycheck Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="m-2">Date: {dateFormatter(paycheck.date)}</Row>
                <Row className="m-2">Company: {paycheck.company}</Row>
                <Row className="m-2">Description: {paycheck.description}</Row>
                <Row className="m-2">Gross Income: {currencyFormatter.format(paycheck.gross)}</Row>
                <Row className="m-2">Taxes: {currencyFormatter.format(paycheck.taxes)}</Row>
                <Row className="m-2">Net Income: {currencyFormatter.format(paycheck.net)}</Row>
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

export default IncomeDetails;