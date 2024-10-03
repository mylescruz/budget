import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

const TransactionDetails = ({transaction, showDetails, setShowDetails, openDelete, openEdit }) => {
    const closeDetails = () => {
        setShowDetails(false);
    };

    return (
        <Modal show={showDetails} onHide={closeDetails} centered>
            <Modal.Header closeButton>
                <Modal.Title>Transaction Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="m-2">Date: {dateFormatter(transaction.date)}</Row>
                <Row className="m-2">Store: {transaction.store}</Row>
                <Row className="m-2">Items Purchased: {transaction.items}</Row>
                <Row className="m-2">Category: {transaction.category}</Row>
                <Row className="m-2">Amount: {currencyFormatter.format(transaction.amount)}</Row>
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

export default TransactionDetails;