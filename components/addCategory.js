import { useState } from "react";
import { Form, Button, Modal, Col, Row} from "react-bootstrap";

const AddCategory = ({updatedCategories, addToCategories, addCategoryClicked, setAddCategoryClicked}) => {
    const emptyCategory = {
        id: 0,
        name: "",
        color: "#000000",
        budget: "",
        actual: 0,
        hasSubcategory: false,
        subcategories: []
    };

    const emptySubcategory = {
        id: 0,
        name: "",
        actual: 0,
        parent: ""
    }

    const [newCategory, setNewCategory] = useState(emptyCategory);
    const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);
    const [subcategoryChecked, setSubcategoryChecked] = useState(false);
    const [hasSubcategory, setHasSubcategory] = useState(newCategory.hasSubcategory);

    console.log(newSubcategory);
    const handleInput = (e) => {
        setNewCategory({ ...newCategory, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setNewCategory({ ...newCategory, budget: input });
        else
            setNewCategory({ ...newCategory, budget: parseFloat(input) });
    };

    const handleSubcategoryInput = (e) => {
        setNewSubcategory({ ...newSubcategory, name: e.target.value})
    };

    let numSubcategory = 0;

    const handleChecked = (e) => {
        if (e.target.checked)
            setSubcategoryChecked(true);
        else
            setSubcategoryChecked(false);
    };

    const closeModal = () => {
        setAddCategoryClicked(false);
    };

    const addNewCategory = (e) => {
        e.preventDefault();

        let maxID = 0;
        if (updatedCategories.length > 0)
            maxID = Math.max(...updatedCategories.map(category => category.id));

        newCategory.id = maxID + 1;
        addToCategories(newCategory);

        closeModal();
    };

    const addToSubcategories = () => {
        setHasSubcategory(true);

        let maxID = 0;
        if (newCategory.subcategories.length > 0)
            maxID = Math.max(...newCategory.subcategories.map(sub => sub.id));
        newSubcategory.id = maxID + 1;

        setNewCategory({ ...newCategory, 
            hasSubcategory: true,
            subcategories: [...newCategory.subcategories, newSubcategory]
        });

        setNewSubcategory(emptySubcategory);
    };

    return (
        <Modal show={addCategoryClicked} onHide={closeModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Enter new category information</Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={addNewCategory}>
                <Modal.Body>
                    <Form.Group className="formInput">
                        <Form.Label>Category name</Form.Label>
                        <Form.Control
                            id="name"
                            className="h-100"
                            type="text"
                            placeholder="Name"
                            value={newCategory.name}
                            onChange={handleInput}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Budget Amount</Form.Label>
                        <Form.Control
                            id="budget"
                            className="h-100"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="$ Amount"
                            value={newCategory.budget}
                            onChange={handleNumInput}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Color</Form.Label>
                        <Form.Control
                            id="color" 
                            type="color" 
                            className="form-control-color" 
                            value={newCategory.color} 
                            onChange={handleInput}
                        />
                    </Form.Group>
                    <Form.Group className="formInput alignX">
                        <Form.Check
                        reverse
                        id="hasSubcategory"
                        className="h-100"
                        type="checkbox"
                        label="Subcategories?"
                        value={newCategory.hasSubcategory}
                        onChange={handleChecked}
                        />
                    </Form.Group>
                    {subcategoryChecked &&
                    <Form.Group className="formInput">
                        <Row className="alignX">
                            <Col>
                                <Form.Control 
                                    id={`subcategory-${numSubcategory}`}
                                    name="name"
                                    className="h-100"
                                    type="text"
                                    placeholder="Subcategory name"
                                    value={newSubcategory.name}
                                    onChange={handleSubcategoryInput}
                                />
                            </Col>
                            <Col>
                                <i className="bi bi-plus-circle plus" onClick={addToSubcategories}></i>
                            </Col>
                        </Row>
                    </Form.Group>
                    }
                    {hasSubcategory && 
                        (newCategory.subcategories.map(subcategory => (
                            <Row key={subcategory.id} className="mx-3">{subcategory.name}</Row> 
                        )))
                    }
                    
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

export default AddCategory;