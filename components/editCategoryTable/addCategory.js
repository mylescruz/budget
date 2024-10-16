import { CategoriesContext } from "@/contexts/CategoriesContext";
import currencyFormatter from "@/helpers/currencyFormatter";
import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row, FloatingLabel} from "react-bootstrap";

const AddCategory = ({ addToCategories, addCategoryClicked, setAddCategoryClicked}) => {
    const emptyCategory = {
        id: 0,
        name: "",
        color: "#000000",
        budget: "",
        actual: 0,
        fixed: false,
        hasSubcategory: false,
        subcategories: []
    };

    const emptySubcategory = {
        id: 0,
        name: "",
        actual: 0
    }

    const { categories } = useContext(CategoriesContext);
    const [newCategory, setNewCategory] = useState(emptyCategory);
    const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);
    const [subcategoryTotal, setSubcategoryTotal] = useState(0);

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

    const handleSubcategoryBudget = (e) => {
        const input = e.target.value;

        if (input == '')
            setNewSubcategory({ ...newSubcategory, actual: input });
        else
            setNewSubcategory({ ...newSubcategory, actual: parseFloat(input) });
    };

    const handleChecked = (e) => {
        if (e.target.checked)
            setNewCategory({...newCategory, hasSubcategory: true});
        else {
            setNewCategory({...newCategory, hasSubcategory: false});
            setNewCategory({...newCategory, subcategories: []});
        }
    };

    const handleFixed = (e) => {
        if (e.target.checked)
            setNewCategory({...newCategory, fixed: true});
        else
            setNewCategory({...newCategory, fixed: false});
    }

    const closeModal = () => {
        setAddCategoryClicked(false);
    };

    const addNewCategory = (e) => {
        e.preventDefault();

        if (!newCategory.hasSubcategory && newCategory.fixed)
            newCategory.actual = newCategory.budget;

        let maxID = 0;
        if (categories.length > 0)
            maxID = Math.max(...categories.map(category => category.id));
        newCategory.id = maxID + 1;

        addToCategories(newCategory);

        closeModal();
    };

    const addToSubcategories = () => {
        let maxID = 0;
        if (newCategory.subcategories.length > 0)
            maxID = Math.max(...newCategory.subcategories.map(sub => sub.id));
        newSubcategory.id = maxID + 1;

        setSubcategoryTotal(subcategoryTotal + newSubcategory.actual);

        if (newCategory.fixed) {
            setNewCategory({ ...newCategory,
                budget: subcategoryTotal + newSubcategory.actual, 
                actual: subcategoryTotal + newSubcategory.actual,
                hasSubcategory: true,
                subcategories: [...newCategory.subcategories, newSubcategory]
            });
        } else {
            setNewCategory({ ...newCategory, 
                hasSubcategory: true,
                subcategories: [...newCategory.subcategories, newSubcategory]
            });
        }

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
                        <Form.Control id="name" className="h-100" type="text" placeholder="Name" value={newCategory.name} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Budget Amount</Form.Label>
                        <Form.Control id="budget" className="h-100" type="number" min="0.01" step="0.01"
                            value={(newCategory.hasSubcategory && newCategory.fixed) ? subcategoryTotal : newCategory.budget}
                            onChange={handleNumInput}
                            disabled={(newCategory.hasSubcategory && newCategory.fixed)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Color</Form.Label>
                        <Form.Control id="color" type="color" className="form-control-color" value={newCategory.color} onChange={handleInput} />
                    </Form.Group>
                    <Form.Group className="formInput alignX">
                        <Form.Check reverse id="fixed" className="h-100" type="checkbox" label="Fixed?" value={newCategory.fixed} onChange={handleFixed} />
                    </Form.Group>
                    <Form.Group className="formInput alignX">
                        <Form.Check reverse id="hasSubcategory" className="h-100" type="checkbox" label="Subcategories?" value={newCategory.hasSubcategory} onChange={handleChecked} />
                    </Form.Group>
                    {newCategory.hasSubcategory &&
                    <Form.Group className="formInput">
                        <Row className="alignX">
                            <Col>
                                <FloatingLabel controlId="floatingName" label="Subcategory" className="small">
                                    <Form.Control name="name" type="text" placeholder="Subcategory" value={newSubcategory.name} onChange={handleSubcategoryInput} />
                                </FloatingLabel>
                            </Col>
                            { (newCategory.hasSubcategory && newCategory.fixed) &&
                            <Col>
                                <FloatingLabel controlId="floatingInput" label="Budget">
                                    <Form.Control name="name" className="w-100" type="number" placeholder="Budget" value={newSubcategory.actual} onChange={handleSubcategoryBudget} />
                                </FloatingLabel>
                            </Col>
                            }
                            <Col>
                                <i className="bi bi-plus-circle plus" onClick={addToSubcategories}></i>    
                            </Col>
                            
                        </Row>
                        
                    </Form.Group>
                    }
                    {newCategory.hasSubcategory && 
                        (newCategory.subcategories.map(subcategory => (
                            <Row key={subcategory.id} className="mx-2">
                                <Col className="text-start">{subcategory.name}{newCategory.fixed && `: ${currencyFormatter.format(subcategory.actual)}`}</Col>
                            </Row> 
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