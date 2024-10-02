import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/categoryRow.module.css";

const CategoryRow = ({ category, transactions }) => {
    let actualAmount = 0;
    transactions.map(transaction => {
        if (transaction.category === category.name) {
            actualAmount += transaction.amount;
        }
    });

    const difference = category.budget - actualAmount;
    return (
        <tr>
            <th scope="row">{category.name}</th>
            <td className={styles.budgetRow}>{currencyFormatter.format(category.budget)}</td>
            <td>{currencyFormatter.format(actualAmount)}</td>
            <td>{currencyFormatter.format(difference)}</td>
        </tr>
    );
};

export default CategoryRow;