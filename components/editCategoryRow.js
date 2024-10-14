import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import AddSubcategory from "./addSubcategory";
import EditSubcategoryRow from "./editSubcategoryRow";

const EditCategoryRow = ({ category, removeCategory, updateCategoryValues }) => {
    const [edittedCategory, setEdittedCategory] = useState(category);

    const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);

    const handleBudgetInput = (e) => {
        const input = e.target.value;
        const actualValue = edittedCategory.fixed ? input : edittedCategory.actual;

        if (input == '') {
            setEdittedCategory({...edittedCategory, budget: input, actual: actualValue});
            updateCategoryValues({...edittedCategory, budget: 0, actual: 0});
        }
        else {
            setEdittedCategory({...edittedCategory, budget: parseFloat(input), actual: parseFloat(actualValue)});
            updateCategoryValues({...edittedCategory, budget: parseFloat(input), actual: parseFloat(actualValue)});
        }
    };

    const handleInput = (e) => {
        const property = e.target.name;
        const input = e.target.value;

        setEdittedCategory({...edittedCategory, [property]: input});
        updateCategoryValues({...edittedCategory, [property]: input});
    };

    const updateSubcategories = (subcategory) => {
        let budgetTotal = edittedCategory.budget;
        
        const updatedSubcategories = edittedCategory.subcategories.map(sub => {
            if (sub.id === subcategory.id) {
                budgetTotal = budgetTotal - sub.actual + subcategory.actual;
                return {...sub, actual: subcategory.actual}
            } else {
                return sub;
            }
        });

        const actualTotal = edittedCategory.fixed ? budgetTotal : edittedCategory.actual;
        
        setEdittedCategory({...edittedCategory, budget: budgetTotal, actual: actualTotal, hasSubcategory: true, subcategories: updatedSubcategories });
        updateCategoryValues({...edittedCategory, budget: budgetTotal, actual: actualTotal, hasSubcategory: true, subcategories: updatedSubcategories });
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
                        <Col><Form.Control type="text" name="name" className="w-100" value={edittedCategory.name} onChange={handleInput}></Form.Control></Col>
                        <Col className="text-end"><i className={`bi bi-plus-circle plus`} onClick={addSubcategory}></i></Col>
                    </Row>
                </th>
                {(edittedCategory.hasSubcategory && edittedCategory.fixed) ?
                    <td><Form.Control type="number" name="budget" className="w-100" value={edittedCategory.budget} disabled></Form.Control></td>
                    :
                    <td><Form.Control type="number" name="budget" className="w-100" min="0" max="100000" step="1" value={edittedCategory.budget} onChange={handleBudgetInput}></Form.Control></td>
                }
                <td><Form.Control type="color" name="color" className="form-control-color" value={edittedCategory.color} onChange={handleInput}></Form.Control></td>
                <td className={`text-center align-middle delete`} onClick={deleteCategory}><i className="bi bi-trash"></i></td>
            </tr>
            {edittedCategory.hasSubcategory && 
                (!edittedCategory.fixed ? 
                    (edittedCategory.subcategories.map(subcategory => (
                        <tr key={subcategory.id}>
                            <td className="text-end">{subcategory.name}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>    
                    ))) 
                    : 
                    (edittedCategory.subcategories.map(subcategory => (
                        <EditSubcategoryRow key={subcategory.id} subcategory={subcategory} updateSubcategories={updateSubcategories} />  
                    )))
                ) 
            }
            {addSubcategoryClicked &&
                <AddSubcategory edittedCategory={edittedCategory} setEdittedCategory={setEdittedCategory} updateCategoryValues={updateCategoryValues} setAddSubcategoryClicked={setAddSubcategoryClicked} />
            }
        </>
    );
};

export default EditCategoryRow;