import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import dateInfo from "@/helpers/dateInfo";
import addToCategoryActual from "@/helpers/addToCategoryActual";
import SelectCategory from "./selectCategory";
import { CategoriesContext } from "@/contexts/CategoriesContext";

const AddTransaction = ({transactions, addToTransactions, addTransactionClicked, setAddTransactionClicked, showTransactions}) => {
    const { categories, updateCategories } = useContext(CategoriesContext);

    const firstNotFixed = categories.find(category => {
        return !category.fixed;
    });

    const emptyTransaction = {
        id: 0,
        date: dateInfo.currentDate,
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

        let maxID = 0;
        if (transactions.length > 0)
            maxID = Math.max(...transactions.map(trans => trans.id));

        newTransaction.id = maxID + 1;
        addToTransactions(newTransaction);

        const updatedCategories = addToCategoryActual(newTransaction, categories);
        updateCategories(updatedCategories);

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
                        <Form.Control id="date" className="h-100" type="date" min={dateInfo.minDate} max={dateInfo.maxDate} value={newTransaction.date} onChange={handleInput} required />
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
                        <Form.Control id="amount" className="h-100" type="number" min="0.01" step="0.01" placeholder="Amount" value={newTransaction.amount} onChange={handleNumInput} required />
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