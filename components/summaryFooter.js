import allTransactions from "@/helpers/allTransactions";
import currencyFormatter from "@/helpers/currencyFormatter";

const SummaryFooter = ({ categories }) => {
    let totalBudget = 0;
    categories.forEach(item => {
        totalBudget += item.budget;
    });

    let totalActual = 0;
    allTransactions.map(transaction => {
        totalActual += transaction.amount;
    });

    const totalDifference = totalBudget - totalActual;

    return (
        <tr>
            <th scope="col">Total</th>
            <td scope="col">{currencyFormatter.format(totalBudget)}</td>
            <td scope="col">{currencyFormatter.format(totalActual)}</td>
            <td scope="col">{currencyFormatter.format(totalDifference)}</td>
        </tr>
    );
};

export default SummaryFooter;