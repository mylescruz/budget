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
            <th scope="col" className="bg-secondary text-white">Total</th>
            <td scope="col" className="bg-secondary text-white">{currencyFormatter.format(totalBudget)}</td>
            <td scope="col" className="bg-secondary text-white">{currencyFormatter.format(totalActual)}</td>
            <td scope="col" className="bg-secondary text-white">{currencyFormatter.format(totalDifference)}</td>
        </tr>
    );
};

export default SummaryFooter;