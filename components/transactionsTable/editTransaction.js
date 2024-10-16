import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import dateInfo from "@/helpers/dateInfo";
import { useContext, useState } from "react";
import editCategoryActual from "@/helpers/editCategoryActual";
import SelectCategory from "./selectCategory";
import { CategoriesContext } from "@/contexts/CategoriesContext";

const EditTransaction = ({transaction, showEdit, setShowEdit, setShowDetails, editOldTransaction}) => {
    const { categories, updateCategories } = useContext(CategoriesContext);
    const [edittedTransaction, setEdittedTransaction] = useState(transaction);

    const closeEdit = () => {
        setShowEdit(false);
        setShowDetails(true);
    };

    const editTransaction = (e) => {
        e.preventDefault();

        if (showEdit) {
            setEdittedTransaction(edittedTransaction);
            editOldTransaction(edittedTransaction);

            const updatedCategories = editCategoryActual(edittedTransaction, transaction, categories);
            updateCategories(updatedCategories);

            setShowEdit(false);
        } else {
            setShowEdit(true);
        }
    };

    const handleInput = (e) => {
        setEdittedTransaction({ ...edittedTransaction, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setEdittedTransaction({ ...edittedTransaction, amount: input });
        else
            setEdittedTransaction({ ...edittedTransaction, amount: parseFloat(input) });
    };

    return (
        <Modal show={showEdit} onHide={closeEdit} centered>
                <Modal.Header>
                    <Modal.Title>Edit Transaction</Modal.Title>
                </Modal.Header>
                <Form onSubmit={editTransaction}>
                    <Modal.Body>
                        <Form.Group className="formInput">
                            <Form.Control id="date" className="h-100" type="date" min={dateInfo.minDate} max={dateInfo.maxDate} value={edittedTransaction.date} onChange={handleInput} required />
                        </Form.Group>
                        <Form.Group className="formInput">
                            <Form.Control id="store" className="h-100" type="text" placeholder="Store" value={edittedTransaction.store} onChange={handleInput} required />
                        </Form.Group>
                        <Form.Group className="formInput">
                            <Form.Control id="items" className="h-100" type="text" placeholder="What was purchased?" value={edittedTransaction.items} onChange={handleInput} required />
                        </Form.Group>
                        <Form.Group className="formInput">
                            <Form.Select id="category" className="h-100" value={edittedTransaction.category} onChange={handleInput} required>
                                <option disabled>Choose a Category...</option>
                                {categories.map(category => (
                                    (!category.fixed && <SelectCategory key={category.id} category={category} />)
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="formInput">
                            <Form.Control id="amount" className="h-100" type="number" min="0.01" placeholder="Amount" value={edittedTransaction.amount} onChange={handleNumInput} required />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form.Group className="formInput">
                            <Row>
                                <Col><Button variant="secondary" onClick={closeEdit}>Cancel</Button></Col>
                                <Col className="text-nowrap"><Button variant="primary" type="submit">Save Changes</Button></Col>
                            </Row>
                        </Form.Group>
                    </Modal.Footer>
                </Form>
        </Modal>
    );
};

export default EditTransaction;