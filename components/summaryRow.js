import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/summaryRow.module.css";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

const SummaryRow = ({ category, transactions, editClicked, updatedCategoryBudgets, setUpdatedCategoryBudgets, updatedCategoryColors, setUpdatedCategoryColors }) => {
    const [newBudgetValue, setNewBudgetValue] = useState(category.budget);
    const [colorValue, setColorValue] = useState(category.color);

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setNewBudgetValue(input);
        else
            setNewBudgetValue(parseFloat(input));

        const updated = updatedCategoryBudgets.map(updatedCategory => {
            if (updatedCategory.id === category.id) {
                if (input == '') {
                    return {
                        ...updatedCategory, budget:input
                    }
                }
                else {
                    return {
                        ...updatedCategory, budget:parseFloat(input)
                    }
                }
            } else
                return updatedCategory;
        });

        setUpdatedCategoryBudgets(updated);
    };

    const handleColorInput = (e) => {
        const newColor = e.target.value;
        setColorValue(newColor);

        const updated = updatedCategoryColors.map(category => {
            if (category.id === category.id) {
                return {
                    ...category, color:newColor
                }
            } else
                return category;
        });

        setUpdatedCategoryColors(updated);
    };

    const difference = category.budget - category.actual;
    return (
        <tr>
            {! editClicked ?
                <th scope="row">{category.name}</th>
                :
                <th scope="row">
                    <Row>
                        <Col>{category.name}</Col>
                        <Col><Form.Control type="color" id={category.name} className="form-control-color" value={colorValue} onChange={handleColorInput}></Form.Control></Col>
                    </Row>
                </th>
            }
            {!editClicked ? 
                <td className={styles.budgetRow}>{currencyFormatter.format(category.budget)}</td>
                :
                <td><Form.Control type="number" id={category.name} className="h-100 w-50" min="0" max="100000" step="1" value={newBudgetValue} onChange={handleNumInput}></Form.Control></td>
            }
            <td>{currencyFormatter.format(category.actual)}</td>
            <td>{currencyFormatter.format(difference)}</td>
        </tr>
    );
};

export default SummaryRow;