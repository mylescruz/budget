import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import AddSubcategory from "./addSubcategory";
import EditSubcategoryRow from "./editSubcategoryRow";

const EditCategoryRow = ({ category, categories, setCategories, removeCategory, updateCategoryValues }) => {
    const [edittedCategory, setEdittedCategory] = useState(category);

    const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);

    const handleBudgetInput = (e) => {
        const property = e.target.name;
        const input = e.target.value;

        if (input == '')
            setEdittedCategory({...edittedCategory, [property]: input});
        else
            setEdittedCategory({...edittedCategory, [property]: parseFloat(input)});

        updateCategoryValues(category, property, input);
    };

    const handleInput = (e) => {
        const property = e.target.name;
        const input = e.target.value;

        setEdittedCategory({...edittedCategory, [property]: input});

        updateCategoryValues(category, property, input);
    };

    const updateSubcategories = (subcategory) => {
        let budgetTotal = edittedCategory.budget;
        
        let updatedSubcategories = edittedCategory.subcategories.map(sub => {
            if (sub.id === subcategory.id) {
                budgetTotal = budgetTotal - sub.actual + subcategory.actual;
                return {...sub, actual: subcategory.actual}
            } else {
                return sub;
            }
        });
        
        setEdittedCategory({...edittedCategory, budget: budgetTotal, subcategories: updatedSubcategories });
        updateCategoryValues(category, "budget", budgetTotal);
        updateCategoryValues(category, "hasSubcategory", true);
        updateCategoryValues(category, "subcategories", updatedSubcategories);
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
                <AddSubcategory edittedCategory={edittedCategory} setEdittedCategory={setEdittedCategory} category={category} categories={categories} setCategories={setCategories} setAddSubcategoryClicked={setAddSubcategoryClicked} />
            }
        </>
    );
};

export default EditCategoryRow;