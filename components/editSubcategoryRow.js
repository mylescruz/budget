import { useState } from "react";
import { Form } from "react-bootstrap";

const EditSubcategoryRow = ({ subcategory, updateSubcategories }) => {
    const [subcategoryValues, setSubcategoryValues] = useState(subcategory);
    
    const handleSubcategoryBudget = (e) => {
        console.log(subcategoryValues);
        const input = e.target.value;

        if (input == '') {
            setSubcategoryValues({...subcategoryValues, actual: input});
            updateSubcategories({...subcategoryValues, actual: 0});
        }
        else {
            setSubcategoryValues({...subcategoryValues, actual: parseFloat(input)});
            updateSubcategories({...subcategoryValues, actual: parseFloat(input)});
        }
    };

    return (
        <tr>
            <td className="text-end align-middle">{subcategoryValues.name}</td>
            <td><Form.Control type="number" name="actual" className="w-100" min="0" max="100000" step="1" value={subcategoryValues.actual} onChange={handleSubcategoryBudget}></Form.Control></td>
            <td></td>
            <td></td>
        </tr>
    );
};

export default EditSubcategoryRow;