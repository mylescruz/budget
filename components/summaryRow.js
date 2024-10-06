import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/summaryRow.module.css";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

const SummaryRow = ({ category, editClicked, updatedCategories, setUpdatedCategories }) => {
    const [newBudgetValue, setNewBudgetValue] = useState(category.budget);
    const [colorValue, setColorValue] = useState(category.color);

    const handleNumInput = (e) => {
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

    const difference = category.budget - category.actual;
    return (
        <tr>
            {! editClicked ?
                <th scope="row">{category.name}</th>
                :
                <th scope="row">
                    <Row>
                        <Col className="col-3"><Form.Control type="color" id={category.name} className="form-control-color" value={colorValue} onChange={handleColorInput}></Form.Control></Col>
                        <Col>{category.name}</Col>
                    </Row>
                </th>
            }
            {!editClicked ? 
                <td className={styles.budgetRow}>{currencyFormatter.format(category.budget)}</td>
                :
                <td><Form.Control type="number" id={category.name} className="w-75" min="0" max="100000" step="1" value={newBudgetValue} onChange={handleNumInput}></Form.Control></td>
            }
            <td>{currencyFormatter.format(category.actual)}</td>
            <td className={difference < 0 ? "text-danger font-weight-bold" : ""}>{currencyFormatter.format(difference)}</td>
        </tr>
    );
};

export default SummaryRow;