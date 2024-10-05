import { useState } from "react";
import { Form, Button, Modal, Col, Row, CardText } from "react-bootstrap";
import dateInfo from "@/helpers/dateInfo";
import addToCategoryActual from "@/helpers/addToCategoryActual";

const AddTransaction = ({transactions, updateTransactions, categories, setCategories, show, setAddClicked, showTransactions}) => {
    const emptyTransaction = {
        id: 0,
        date: dateInfo.currentDate,
        store: "",
        items: "",
        category: "Rent",
        amount: ""
    };

    const [newTransaction, setTransaction] = useState(emptyTransaction);

    const handleInput = (e) => {
        setTransaction({ ...newTransaction, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setTransaction({ ...newTransaction, amount: input });
        else
            setTransaction({ ...newTransaction, amount: parseFloat(input) });
    };

    const AddTransaction = (e) => {
        e.preventDefault();

        let maxID = 0;
        if (transactions.length > 0)
            maxID = Math.max(...transactions.map(trans => trans.id));

        newTransaction.id = maxID + 1;
        updateTransactions(newTransaction);

        const updatedCategories = addToCategoryActual(newTransaction, categories);
        setCategories(updatedCategories);

        setTransaction(emptyTransaction);
        setAddClicked(false);
        showTransactions();
    };

    const closeModal = () => {
        setTransaction(emptyTransaction);
        setAddClicked(false);
    }

    return (
        <Modal show={show} onHide={closeModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Enter transaction information</Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={AddTransaction}>
                <Modal.Body>
                    <Form.Group className="formInput">
                        <Form.Control
                            id="date"
                            className="h-100"
                            type="date"
                            min={dateInfo.minDate}
                            max={dateInfo.maxDate}
                            value={newTransaction.date}
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
                            value={newTransaction.store}
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
                            value={newTransaction.items}
                            onChange={handleInput}
                            required
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Select id="category" className="h-100" 
                        value={newTransaction.category}
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
                            value={newTransaction.amount}
                            onChange={handleNumInput}
                            required
                        ></Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Form.Group className="formInput">
                        <Row>
                            <Col><Button variant="secondary" onClick={closeModal}>Close</Button></Col>
                            <Col><Button variant="primary" type="submit">Add</Button></Col>
                        </Row>
                    </Form.Group>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddTransaction;