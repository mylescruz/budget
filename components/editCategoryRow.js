import { useState } from "react";
import { Form } from "react-bootstrap";

const EditCategoryRow = ({ category, setAddSubcategoryClicked, updatedCategories, setUpdatedCategories }) => {
    const [newBudgetValue, setNewBudgetValue] = useState(category.budget);
    const [colorValue, setColorValue] = useState(category.color);

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

    const handleColorInput = (e) => {
        const newColor = e.target.value;
        setColorValue(newColor);

        const updated = updatedCategories.map(updatedCategory => {
            if (updatedCategory.id === category.id) {
                return {...updatedCategory, color:newColor}
            } else
                return updatedCategory;
        });

        setUpdatedCategories(updated);
    };

    const addSubcategory = () => {
        setAddSubcategoryClicked(true);
    };
    
    return (
        <>
            <tr>
                <th scope="row" className="text-nowrap">{category.name}</th>
                <td><Form.Control type="number" name="budget" className="w-100" min="0" max="100000" step="1" value={newBudgetValue} onChange={handleBudgetInput}></Form.Control></td>
                <td><Form.Control type="color" name="color" className="form-control-color" value={colorValue} onChange={handleColorInput}></Form.Control></td>
                <td className="col-1 text-center"><i className="bi bi-plus-circle" onClick={addSubcategory}></i></td>
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
        </>
    );
};

export default EditCategoryRow;