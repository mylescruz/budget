import { useState } from "react";
import { Form } from "react-bootstrap";

const EditSubcategoryRow = ({ subcategory, fixed, updateSubcategories, deleteSubcategory }) => {
    const [subcategoryValues, setSubcategoryValues] = useState(subcategory);
    
    const handleSubcategoryBudget = (e) => {
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

    const removeSubcategory = () => {
        deleteSubcategory(subcategory);
    };

    return (
        <tr>
            <td className="text-end align-middle">{subcategoryValues.name}</td>
            <td>{fixed && <Form.Control type="number" name="actual" className="w-100" min="0" max="100000" step="1" value={subcategoryValues.actual} onChange={handleSubcategoryBudget} />}</td>
            <td></td>
            <td className={`text-center align-middle delete`} onClick={removeSubcategory}><i className="bi bi-trash"></i></td>
        </tr>
    );
};

export default EditSubcategoryRow;