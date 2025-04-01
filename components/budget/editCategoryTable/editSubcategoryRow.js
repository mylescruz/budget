import PopUp from "@/components/layout/popUp";
import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

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
        <tr className="d-flex">
            <td className="col-7 col-md-8">
                <Row className="w-100 d-flex align-items-center">
                    <Col className="col-4">
                        {(!fixed && subcategory.actual !== 0) ?
                            <PopUp title={`There are ${subcategory.name} transactions for this month. Change those in order to delete this category`} id={`subcategory-${subcategory.id}-delete-info`}>
                                <span>&#9432;</span>
                            </PopUp>
                            :
                            <i className="bi bi-trash delete" onClick={removeSubcategory}/>
                        }
                    </Col>
                    <Col className="col-8">
                        <Form.Control type="text" name="subcategory-name" className="text-end" value={subcategoryValues.name} onChange={handleInput} />
                    </Col>
                    
                </Row>
            </td>
            <td className="col-3 col-md-2">
                {fixed && <Form.Control type="number" name="actual" className="px-1 text-end" min="0" max="100000" step="0.01" value={subcategoryValues.actual} onChange={handleSubcategoryBudget} />}
            </td>
            <td className="col-2"></td>
        </tr>
    );
};

export default EditSubcategoryRow;