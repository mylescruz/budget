import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

const AddSubcategory = ({ edittedCategory, setEdittedCategory, updateCategoryValues, setAddSubcategoryClicked }) => {
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

    const addToCategory = (e) => {
        e.preventDefault();

        if (newSubcategory.name === '')
            return;

        let maxID = 0;
        if (edittedCategory.hasSubcategory) {
            maxID = Math.max(...edittedCategory.subcategories.map(subcategory => subcategory.id));
            setEdittedCategory({...edittedCategory, subcategories: [...edittedCategory.subcategories, {...newSubcategory, id: maxID + 1}]});
            updateCategoryValues({...edittedCategory, subcategories: [...edittedCategory.subcategories, {...newSubcategory, id: maxID + 1}]});
        } else {
            const budgetValue = edittedCategory.fixed ? 0 : edittedCategory.budget;
            const actualValue = edittedCategory.fixed ? budgetValue : edittedCategory.actual;

            setEdittedCategory({...edittedCategory, budget: budgetValue, actual: actualValue, hasSubcategory: true, subcategories: [{...newSubcategory, id: maxID}]});
            updateCategoryValues({...edittedCategory, budget: budgetValue, actual: actualValue, hasSubcategory: true, subcategories: [{...newSubcategory, id: maxID}]});
        }

        setAddSubcategoryClicked(false);
    };

    return (
        <tr>
            <td>
                <Row className="flex-start">
                    <Col className="col-8 add-sub">
                        <Form.Control id="name" className="add-subcategory" type="text" placeholder="Subcategory" value={newSubcategory.name} onChange={handleInput} />
                    </Col>
                    <Col className="col-1 cancel-sub">
                        <i className={`bi bi-x-circle cancel`} onClick={cancelAddSubcategory}></i>
                    </Col>
                    <Col className="col-1 check-sub">
                        <i className={`bi bi-check-circle check`} onClick={addToCategory}></i>
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