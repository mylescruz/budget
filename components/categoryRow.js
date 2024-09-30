import currencyFormatter from "@/helpers/currencyFormatter";
import transactions from "@/helpers/transactions";

const CategoryRow = ({ category }) => {
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
            <td>{currencyFormatter.format(category.budget)}</td>
            <td>{currencyFormatter.format(actualAmount)}</td>
            <td>{currencyFormatter.format(difference)}</td>
        </tr>
    );
};

export default CategoryRow;