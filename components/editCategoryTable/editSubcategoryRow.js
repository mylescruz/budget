import { useState } from "react";
import { Form } from "react-bootstrap";

const EditSubcategoryRow = ({ subcategory, fixed, updateSubcategory, deleteSubcategory }) => {
    const [subcategoryValues, setSubcategoryValues] = useState(subcategory);
    
    const handleSubcategoryBudget = (e) => {
        const input = e.target.value;

        if (input == '') {
            setSubcategoryValues({...subcategoryValues, actual: input});
            updateSubcategory({...subcategoryValues, actual: 0});
        }
        else {
            setSubcategoryValues({...subcategoryValues, actual: parseFloat(input)});
            updateSubcategory({...subcategoryValues, actual: parseFloat(input)});
        }
    };

    const handleInput = (e) => {
        const input = e.target.value;

        setSubcategoryValues({...subcategoryValues, name: input});
        updateSubcategory({...subcategoryValues, name: input});
    };

    const removeSubcategory = () => {
        deleteSubcategory(subcategory);
    };

    return (
        <tr>
            <td><Form.Control type="text" name="name" className="w-50 float-end text-end" value={subcategoryValues.name} onChange={handleInput}></Form.Control></td>
            <td>{fixed && <Form.Control type="number" name="actual" className="w-100" min="0" max="100000" step="0.01" value={subcategoryValues.actual} onChange={handleSubcategoryBudget} />}</td>
            <td></td>
            <td className="text-center align-middle delete" onClick={removeSubcategory}><i className="bi bi-trash"></i></td>
        </tr>
    );
};

export default EditSubcategoryRow;