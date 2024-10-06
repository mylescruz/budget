import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/summaryRow.module.css";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import AddSubcategory from "./addSubcategory";
import SubcategoryRow from "./subcategoryRow";

const SummaryRow = ({ category, editClicked, updatedCategories, setUpdatedCategories }) => {
    const [newBudgetValue, setNewBudgetValue] = useState(category.budget);
    const [colorValue, setColorValue] = useState(category.color);
    const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);
    const hasSubcategory = category.hasSubcategory;
    const [showSubcategories, setShowSubcategories] = useState(false);

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

        const updated = updatedCategories.map(category => {
            if (category.name === e.target.id) {
                return {...category, color:newColor}
            } else
                return category;
        });

        setUpdatedCategories(updated);
    };

    const addSubcategory = () => {
        setAddSubcategoryClicked(true);
    };

    const dropdownSubcategories = () => {
        setShowSubcategories(!showSubcategories);
        console.log(updatedCategories);
    };

    const difference = category.budget - category.actual;
    return (
        <>
            <tr>
                {! editClicked ?
                    <th scope="row" className={styles.cell}>
                        <Row>
                            <Col>{category.name}</Col>
                            {hasSubcategory && (
                                showSubcategories ? 
                                    <Col><i className="bi bi-chevron-up" onClick={dropdownSubcategories}></i></Col>
                                    :
                                    <Col><i className="bi bi-chevron-down" onClick={dropdownSubcategories}></i></Col>
                                )
                            }
                        </Row>
                    </th>
                    :
                    <th scope="row">
                        <Row>
                            <Col className="col-4"><Form.Control type="color" id={category.name} className="form-control-color" value={colorValue} onChange={handleColorInput}></Form.Control></Col>
                            <Col className={styles.cell}>{category.name}</Col>
                            <Col className="col-1"><i className="bi bi-plus-circle" onClick={addSubcategory}></i></Col>
                        </Row>
                    </th>
                }
                {!editClicked ? 
                    <td className={styles.budgetRow}>{currencyFormatter.format(category.budget)}</td>
                    :
                    <td><Form.Control type="number" id={category.name} className="w-100" min="0" max="100000" step="1" value={newBudgetValue} onChange={handleBudgetInput}></Form.Control></td>
                }
                <td>{currencyFormatter.format(category.actual)}</td>
                <td className={difference < 0 ? "text-danger font-weight-bold" : ""}>{currencyFormatter.format(difference)}</td>
            </tr>
            {showSubcategories &&
                category.subcategories.map(subcategory => (
                    <SubcategoryRow key={subcategory.id} subcategory={subcategory} />
                ))
            }

            {addSubcategoryClicked && <AddSubcategory category={category} categories={updatedCategories} setUpdatedCategories={setUpdatedCategories} addSubcategoryClicked={addSubcategoryClicked} setAddSubcategoryClicked={setAddSubcategoryClicked}/>}
        </>
    );
};

export default SummaryRow;