import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/summaryRow.module.css";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";

const SummaryRow = ({ category, transactions, editClicked, updatedCategoryBudgets, setUpdatedCategoryBudgets }) => {
    const [newBudgetValue, setNewBudgetValue] = useState(category.budget);
    // const [newActualValue, setNewActualValue] = useState(category.actual);

    // useEffect(() => {
        

    //     setNewActualValue(actualAmount);
    // },[transactions, category.name]);

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

    // let actualAmount = 0;
    // transactions.map(transaction => {
    //     if (transaction.category === category.name) {
    //         actualAmount += transaction.amount;
    //     }
    // });

    const difference = category.budget - category.actual;
    return (
        <tr>
            <th scope="row">{category.name}</th>
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