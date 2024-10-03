import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import { Button, Col, Container, Form, Modal, ModalBody, Row } from "react-bootstrap";
import dateInfo from "@/helpers/dateInfo";

const TransactionDetails = ({transaction, showDetails, setDetails, categories, updateTransactions }) => {
    const [editClicked, setEditClicked] = useState(false);
    const [edittedTransaction, setEditTransaction] = useState(transaction);
    const [editButtonText, setEditButtonText] = useState("Edit");

    const closeDetails = () => {
        setDetails(false);
    };

    const cancelEdit = () => {
        setEditClicked(false);
        setEditButtonText("Edit");
    };

    const editTransaction = (e) => {
        e.preventDefault();

        if (!editClicked) {
            setEditClicked(true);
            setEditButtonText("Save changes");
        } else {
            setEditTransaction(edittedTransaction);
            updateTransactions(edittedTransaction);
            cancelEdit();
        }
    };

    const handleInput = (e) => {
        setEditTransaction({ ...edittedTransaction, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setEditTransaction({ ...edittedTransaction, amount: input });
        else
            setEditTransaction({ ...edittedTransaction, amount: parseFloat(input) });
    };

    return (
        <Modal show={showDetails} onHide={closeDetails} centered>
            <Modal.Header closeButton>
                <Modal.Title>Transaction Details</Modal.Title>
            </Modal.Header>
            <Form onSubmit={editTransaction}>
                {!editClicked ?
                    <Modal.Body>
                        <Row className="m-2">Date: {dateFormatter(transaction.date)}</Row>
                        <Row className="m-2">Store: {transaction.store}</Row>
                        <Row className="m-2">Items Purchased: {transaction.items}</Row>
                        <Row className="m-2">Category: {transaction.category}</Row>
                        <Row className="m-2">Amount: {currencyFormatter.format(transaction.amount)}</Row>
                    </Modal.Body> 
                :
                    <Modal.Body>
                        <Form.Group className="formInput">
                            <Form.Control
                                id="date"
                                className="h-100"
                                type="date"
                                min={dateInfo.minDate}
                                max={dateInfo.maxDate}
                                value={edittedTransaction.date}
                                onChange={handleInput}
                                required
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group className="formInput">
                            <Form.Control
                                id="store"
                                className="h-100"
                                type="text"
                                placeholder="Store/Restaurant"
                                value={edittedTransaction.store}
                                onChange={handleInput}
                                required
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group className="formInput">
                            <Form.Control
                                id="items"
                                className="h-100"
                                type="text"
                                placeholder="What was purchased?"
                                value={edittedTransaction.items}
                                onChange={handleInput}
                                required
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group className="formInput">
                            <Form.Select id="category" className="h-100" 
                            value={edittedTransaction.category}
                            onChange={handleInput}
                            required>
                                <option disabled>Choose a Category...</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>{category.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="formInput">
                            <Form.Control
                                id="amount"
                                className="h-100"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Amount"
                                value={edittedTransaction.amount}
                                onChange={handleNumInput}
                                required
                            ></Form.Control>
                        </Form.Group>
                    </Modal.Body>
                }
                <Modal.Footer>
                    <Form.Group className="formInput">
                        <Row>
                            { editClicked && <Col><Button variant="secondary" onClick={cancelEdit}>Cancel</Button></Col>}
                            <Col className="text-nowrap"><Button variant="info" type="submit">{editButtonText}</Button></Col>
                        </Row>
                    </Form.Group>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default TransactionDetails;