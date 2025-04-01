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
            // If the editted category already has a subcategory

            // Find the max ID in the subcategories array and add one for the new ID
            maxID = Math.max(...edittedCategory.subcategories.map(subcategory => subcategory.id));

            // Updates the category with the new subcategory and new ID
            setEdittedCategory({...edittedCategory, subcategories: [...edittedCategory.subcategories, {...newSubcategory, id: maxID + 1}]});
            updateCategoryValues({...edittedCategory, subcategories: [...edittedCategory.subcategories, {...newSubcategory, id: maxID + 1}]});
        } else {
            // If the editted category didn't already have a subcategory

            /* 
                If the category is fixed, the budget is now dependent on the subcategories' totals
                If not, the budget still remains the same
            */
            const budgetValue = edittedCategory.fixed ? 0 : edittedCategory.budget;

            /*
                If the category is fixed, the actual spent is the same as the budget
                If not, the actual value remains the same
            */
            const actualValue = edittedCategory.fixed ? budgetValue : edittedCategory.actual;

            // Updates the category's budget, actual and hasSubcategory flag and adds the new subcategory
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
        </tr>
    )
};

export default AddSubcategory;