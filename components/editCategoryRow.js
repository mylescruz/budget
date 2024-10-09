import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import AddSubcategory from "./addSubcategory";

const EditCategoryRow = ({ category, updatedCategories, setUpdatedCategories, removeCategory }) => {
    const [categoryName, setCategoryName] = useState(category.name);
    const [newBudgetValue, setNewBudgetValue] = useState(category.budget);
    const [colorValue, setColorValue] = useState(category.color);
    const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);

    const handleBudgetInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setNewBudgetValue(input);
        else
            setNewBudgetValue(parseFloat(input));

        const updated = updatedCategories.map(updatedCategory => {
            if (updatedCategory.id === category.id) {
                if (input == '')
                    return {...updatedCategory, budget:input}
                else
                    return {...updatedCategory, budget:parseFloat(input)}
            } else
                return updatedCategory;
        });

        setUpdatedCategories(updated);
    };

    const handleInput = (e) => {
        const property = e.target.name;
        const input = e.target.value;

        if (property === 'name')
            setCategoryName(input);
        else
            setColorValue(input);

        const updated = updatedCategories.map(updatedCategory => {
            if (updatedCategory.id === category.id) {
                return {...updatedCategory, [e.target.name]: input}
            } else
                return updatedCategory;
        });

        setUpdatedCategories(updated);
    };

    const addSubcategory = () => {
        setAddSubcategoryClicked(true);
    };

    const deleteCategory = () => {
        removeCategory(category);
    };
    
    return (
        <>
            <tr>
                <th scope="row" className="text-nowrap">
                    <Row className="alignX">
                        <Col><Form.Control type="text" name="name" className="w-100" value={categoryName} onChange={handleInput}></Form.Control></Col>
                        <Col className="text-end"><i className={`bi bi-plus-circle plus`} onClick={addSubcategory}></i></Col>
                    </Row>
                </th>
                <td><Form.Control type="number" name="budget" className="w-100" min="0" max="100000" step="1" value={newBudgetValue} onChange={handleBudgetInput}></Form.Control></td>
                <td><Form.Control type="color" name="color" className="form-control-color" value={colorValue} onChange={handleInput}></Form.Control></td>
                <td className={`text-center align-middle delete`} onClick={deleteCategory}><i className="bi bi-trash"></i></td>
            </tr>
            {category.hasSubcategory && 
                (category.subcategories.map(subcategory => (
                    <tr key={subcategory.id}>
                        <td className="text-end">{subcategory.name}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>    
                )))
            }
            {addSubcategoryClicked &&
                <AddSubcategory category={category} categories={updatedCategories} setUpdatedCategories={setUpdatedCategories} addSubcategoryClicked={addSubcategoryClicked} setAddSubcategoryClicked={setAddSubcategoryClicked} />
            }
        </>
    );
};

export default EditCategoryRow;