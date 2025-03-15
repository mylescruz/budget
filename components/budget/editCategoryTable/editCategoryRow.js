import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import AddSubcategory from "./addSubcategory";
import EditSubcategoryRow from "./editSubcategoryRow";

const EditCategoryRow = ({ category, deleteCategory, updateCategoryValues }) => {
    const [edittedCategory, setEdittedCategory] = useState(category);
    const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);

    // The only category that cannot be deleted
    const dontDelete = "Guilt Free Spending";

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

    const updateSubcategory = (subcategory) => {
        let budgetTotal = edittedCategory.budget;
        
        // Map through each subcategory and remove the current subcategory actual value and add the new value to the budget
        const updatedSubcategories = edittedCategory.subcategories.map(sub => {
            if (sub.id === subcategory.id) {
                budgetTotal = parseFloat((budgetTotal - sub.actual + subcategory.actual).toFixed(2));
                return {...sub, name: subcategory.name, actual: subcategory.actual}
            } else {
                return sub;
            }
        });

        /* 
            If the category is fixed, set the actual equal to the budget
            If not, keep it set to the category's current actual value
        */
        const actualTotal = edittedCategory.fixed ? budgetTotal : edittedCategory.actual;
        
        setEdittedCategory({...edittedCategory, budget: budgetTotal, actual: actualTotal, hasSubcategory: true, subcategories: updatedSubcategories });
        updateCategoryValues({...edittedCategory, budget: budgetTotal, actual: actualTotal, hasSubcategory: true, subcategories: updatedSubcategories });
    };

    const addSubcategory = () => {
        setAddSubcategoryClicked(true);
    };

    const removeCategory = () => {
        // Removes a category from the categories array by sending a DELETE request to the API
        deleteCategory(category);
    };

    const deleteSubcategory = (subcategory) => {
        // Remove the requested subcategory from the category's subcategories array
        const updatedSubcategories = edittedCategory.subcategories.filter(sub => {
            return sub.id !== subcategory.id;
        });

        // Update the category's budget to remove the subcategory's actual value
        const budgetTotal = parseFloat((edittedCategory.budget - subcategory.actual).toFixed(2));

        // If the category is fixed, keep the actual value to the current budget
        // If the category isn't fixed, keep the current actual value
        const actualTotal = edittedCategory.fixed ? budgetTotal : edittedCategory.actual;

        // Updates the category's budget and actual value and set the hasSubcategory flag based on if there are any subcategories left
        setEdittedCategory({...edittedCategory, budget: budgetTotal, actual: actualTotal, hasSubcategory: (updatedSubcategories.length > 0), subcategories: updatedSubcategories});
        updateCategoryValues({...edittedCategory, budget: budgetTotal, actual: actualTotal, hasSubcategory: (updatedSubcategories.length > 0), subcategories: updatedSubcategories});
    };
    
    return (
        <>
            <tr>
                <th className="text-nowrap">
                    <Row className="alignX w-100">
                        {edittedCategory.name !== dontDelete ? 
                            <Col className="col-9"><Form.Control type="text" name="name" className="input-category" value={edittedCategory.name} onChange={handleInput} /></Col>
                            :
                            <Col className="col-9 mt-2 cell">{category.name}</Col>
                        }
                        <Col className="col-1"><i className={`bi bi-plus-circle plus`} onClick={addSubcategory}></i></Col>
                    </Row>
                </th>
                {((edittedCategory.hasSubcategory && edittedCategory.fixed) || edittedCategory.name === dontDelete) ?
                    <td><Form.Control type="number" name="budget" className="input-number" step="0.01" value={edittedCategory.budget} disabled /></td>
                    :
                    <td><Form.Control type="number" name="budget" className="input-number" min="0" max="100000" step="0.01" value={edittedCategory.budget} onChange={handleBudgetInput} /></td>
                }
                <td><Form.Control type="color" name="color" className="form-control-color" value={edittedCategory.color} onChange={handleInput}></Form.Control></td>
                {edittedCategory.name !== dontDelete ? 
                    <td className={`text-center align-middle delete`} onClick={removeCategory}><i className="bi bi-trash"></i></td>
                    :
                    <td></td>
                }
            </tr>
            {edittedCategory.hasSubcategory &&      
                (edittedCategory.subcategories.map(subcategory => (
                    <EditSubcategoryRow key={subcategory.id} subcategory={subcategory} fixed={edittedCategory.fixed} updateSubcategory={updateSubcategory} deleteSubcategory={deleteSubcategory}/>  
                )))
            }
            {addSubcategoryClicked &&
                <AddSubcategory edittedCategory={edittedCategory} setEdittedCategory={setEdittedCategory} updateCategoryValues={updateCategoryValues} setAddSubcategoryClicked={setAddSubcategoryClicked} />
            }
        </>
    );
};

export default EditCategoryRow;