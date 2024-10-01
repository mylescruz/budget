import currencyFormatter from "@/helpers/currencyFormatter";

const SummaryFooter = ({ categories, transactions }) => {
    let totalBudget = 0;
    categories.forEach(item => {
        totalBudget += item.budget;
    });

    let totalActual = 0;
    transactions.map(transaction => {
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