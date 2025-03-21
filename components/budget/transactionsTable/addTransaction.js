import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import addTransactionToCategoryActual from "@/helpers/addTransactionToCategoryActual";
import SelectCategory from "./selectCategory";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import dateInfo from "@/helpers/dateInfo";

const AddTransaction = ({transactions, postTransaction, monthInfo, addTransactionClicked, setAddTransactionClicked, showTransactions}) => {
    const { categories, putCategories } = useContext(CategoriesContext);

    // When adding a new transaction, the first category option should be the first one that is not fixed and doesn't have a subcategory
    const firstNotFixed = categories.find(category => {
        return (!category.fixed && !category.hasSubcategory);
    });

    // Set the date for a new transaction either the current date or the first of the month based on if the user is looking at current budget or history
    const newTransactionDate = dateInfo.currentMonth === monthInfo.month ? dateInfo.currentDate : monthInfo.startOfMonthDate;

    const emptyTransaction = {
        id: 0,
        date: newTransactionDate,
        store: "",
        items: "",
        category: firstNotFixed.name,
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

    const AddNewTransaction = (e) => {
        e.preventDefault();

        // Find the max ID in the transactions array and add one for the new ID
        let maxID = 0;
        if (transactions.length > 0)
            maxID = Math.max(...transactions.map(trans => trans.id));

        newTransaction.id = maxID + 1;

        // Adds the new transaction to the transactions array by sending a POST request to the API
        postTransaction(newTransaction);

        // Updates the categories array with the new category actual value by sending a PUT request to the API
        const updatedCategories = addTransactionToCategoryActual(newTransaction, categories);
        putCategories(updatedCategories);

        setTransaction(emptyTransaction);
        setAddTransactionClicked(false);
        showTransactions();
    };

    const closeModal = () => {
        setTransaction(emptyTransaction);
        setAddTransactionClicked(false);
    }

    return (
        <Modal show={addTransactionClicked} onHide={closeModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Enter transaction information</Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={AddNewTransaction}>
                <Modal.Body>
                    <Form.Group className="formInput">
                        <Form.Control id="date" className="h-100" type="date" min={monthInfo.startOfMonthDate} max={monthInfo.endOfMonthDate} value={newTransaction.date} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Control id="store" className="h-100" type="text" placeholder="Store/Restaurant" value={newTransaction.store} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Control id="items" className="h-100" type="text" placeholder="What was purchased?" value={newTransaction.items} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Select id="category" className="h-100" value={newTransaction.category} onChange={handleInput} required>
                            <option disabled>Choose a Category...</option>
                            {categories.map(category => (
                                (!category.fixed && <SelectCategory key={category.id} category={category} />)
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Control id="amount" className="h-100" type="number" step="0.01" placeholder="Amount" value={newTransaction.amount} onChange={handleNumInput} required />
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