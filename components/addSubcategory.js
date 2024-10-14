import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

const AddSubcategory = ({ edittedCategory, setEdittedCategory, setAddSubcategoryClicked }) => {
    const emptySubcategory = {
        id: 0,
        name: "",
        actual: 0
    };

    const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);

    const handleInput = (e) => {
        setNewSubcategory({ ...newSubcategory, [e.target.id]: e.target.value});
    };

    const cancelAddSubcategory = () => {
        setAddSubcategoryClicked(false);
    };

    const addToCategories = (e) => {
        e.preventDefault();

        if (newSubcategory.name === '')
            return;

        let maxID = 0;
        if (edittedCategory.hasSubcategory) {
            maxID = Math.max(...edittedCategory.subcategories.map(subcategory => subcategory.id));
            setEdittedCategory({...edittedCategory, subcategories: [...edittedCategory.subcategories, {...newSubcategory, id: maxID + 1}]});
        } else {
            setEdittedCategory({...edittedCategory, budget: 0, hasSubcategory: true, subcategories: [{...newSubcategory, id: maxID}]});
        }

        setAddSubcategoryClicked(false);
    };

    return (
        <tr>
            <td>
                <Row className="alignX">
                    <Col className="col-9">
                        <Form.Group className="formInput">
                            <Form.Control
                            id="name"
                            className="h-100"
                            type="text"
                            placeholder="Add subcategory"
                            value={newSubcategory.name}
                            onChange={handleInput}
                            />
                        </Form.Group>
                    </Col>
                    <Col className="col-1">
                        <i className={`bi bi-x-circle cancel`} onClick={cancelAddSubcategory}></i>
                    </Col>
                    <Col className="col-1">
                        <i className={`bi bi-check-circle check`} onClick={addToCategories}></i>
                    </Col>
                </Row>
            </td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    )
};

export default AddSubcategory;