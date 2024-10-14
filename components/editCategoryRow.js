import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import AddSubcategory from "./addSubcategory";
import EditSubcategoryRow from "./editSubcategoryRow";

const EditCategoryRow = ({ category, categories, setCategories, removeCategory, updateCategoryValues }) => {
    const [categoryValues, setCategoryValues] = useState({
        name: category.name, 
        color: category.color,
        budget: category.budget, 
        fixed: category.fixed,
        hasSubcategory: category.hasSubcategory,
        subcategories: category.subcategories
    });

    const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);

    const handleBudgetInput = (e) => {
        const property = e.target.name;
        const input = e.target.value;

        if (input == '')
            setCategoryValues({...categoryValues, [property]: input});
        else
            setCategoryValues({...categoryValues, [property]: parseFloat(input)});

        updateCategoryValues(category, property, input);
    };

    const handleInput = (e) => {
        const property = e.target.name;
        const input = e.target.value;

        setCategoryValues({...categoryValues, [property]: input});

        updateCategoryValues(category, property, input);
    };

    const updateSubcategories = (subcategory) => {
        let budgetTotal = categoryValues.budget;
        
        let updatedSubcategories = categoryValues.subcategories.map(sub => {
            if (sub.id === subcategory.id) {
                budgetTotal = budgetTotal - sub.actual + subcategory.actual;
                return {...sub, actual: subcategory.actual}
            } else {
                return sub;
            }
        });
        
        setCategoryValues({...categoryValues, budget: budgetTotal, subcategories: updatedSubcategories });
        updateCategoryValues(category, "budget", budgetTotal);
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
                        <Col><Form.Control type="text" name="name" className="w-100" value={categoryValues.name} onChange={handleInput}></Form.Control></Col>
                        <Col className="text-end"><i className={`bi bi-plus-circle plus`} onClick={addSubcategory}></i></Col>
                    </Row>
                </th>
                {(category.hasSubcategory && category.fixed) ?
                    <td><Form.Control type="number" name="budget" className="w-100" value={categoryValues.budget} disabled></Form.Control></td>
                    :
                    <td><Form.Control type="number" name="budget" className="w-100" min="0" max="100000" step="1" value={categoryValues.budget} onChange={handleBudgetInput}></Form.Control></td>
                }
                <td><Form.Control type="color" name="color" className="form-control-color" value={categoryValues.color} onChange={handleInput}></Form.Control></td>
                <td className={`text-center align-middle delete`} onClick={deleteCategory}><i className="bi bi-trash"></i></td>
            </tr>
            {category.hasSubcategory && 
                (!category.fixed ? 
                    (category.subcategories.map(subcategory => (
                        <tr key={subcategory.id}>
                            <td className="text-end">{subcategory.name}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>    
                    ))) 
                    : 
                    (category.subcategories.map(subcategory => (
                        <EditSubcategoryRow key={subcategory.id} subcategory={subcategory} updateSubcategories={updateSubcategories} />  
                    )))
                ) 
            }
            {addSubcategoryClicked &&
                <AddSubcategory categoryValues={categoryValues} setCategoryValues={setCategoryValues} category={category} categories={categories} setCategories={setCategories} setAddSubcategoryClicked={setAddSubcategoryClicked} />
            }
        </>
    );
};

export default EditCategoryRow;