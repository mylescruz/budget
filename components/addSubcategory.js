import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

const AddSubcategory = ({ category, categories, setUpdatedCategories, addSubcategoryClicked, setAddSubcategoryClicked}) => {
    const emptySubcategory = {
        id: 0,
        name: "",
        budget: "",
        actual: 0,
        parent: category.name
    };

    const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);

    const handleInput = (e) => {
        setNewSubcategory({ ...newSubcategory, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setNewSubcategory({ ...newSubcategory, budget: input });
        else
        setNewSubcategory({ ...newSubcategory, budget: parseFloat(input) });
    };

    const closeSubcategory = () => {
        setAddSubcategoryClicked(false);
    };

    const addToCategories = (e) => {
        e.preventDefault();

        let maxID = 0;
        if (category.hasSubcategory)
            maxID = Math.max(...category.subcategories.map(subCategory => subCategory.id));

        const newID = maxID + 1;
        setNewSubcategory({...newSubcategory, id: newID})

        const updatedCategories = categories.map(oldCategory => {
            if (oldCategory.id === category.id) {
                return {
                    ...oldCategory,
                    hasSubcategory: true,
                    subcategories: [
                        ...oldCategory.subcategories,
                        {...newSubcategory, id: newID}
                    ]
                }
            } else {
                return oldCategory;
            }
            
        });

        setUpdatedCategories(updatedCategories);
        closeSubcategory();
    };

    return (
        <Modal show={addSubcategoryClicked} onHide={closeSubcategory}>
            <Modal.Header closeButton>Add subcategory?</Modal.Header>
            <Form onSubmit={addToCategories}>
                <Modal.Body>
                    <Form.Group className="formInput">
                        <Form.Control
                            id="name"
                            className="h-100"
                            type="text"
                            placeholder="Subcategory name"
                            value={newSubcategory.name}
                            onChange={handleInput}
                            required
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Control
                            id="budget"
                            className="h-100"
                            type="number"
                            placeholder="Optional Budget Amount"
                            value={newSubcategory.budget}
                            onChange={handleNumInput}
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Control
                            id="parent"
                            className="h-100"
                            type="text"
                            value={newSubcategory.parent}
                            disabled
                        ></Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Form.Group className="formInput">
                        <Row>
                            <Col><Button variant="secondary" onClick={closeSubcategory}>Cancel</Button></Col>
                            <Col className="text-nowrap"><Button variant="primary" type="submit">Add</Button></Col>
                        </Row>
                    </Form.Group>
                </Modal.Footer>
            </Form>
        </Modal>
    )
};

export default AddSubcategory;