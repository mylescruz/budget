const SummaryFooter = ({ categories }) => {
    let totalBudget = 0;
    let totalActual = 0;

    categories.forEach(item => {
        totalBudget += item.budget;
        totalActual += item.actual;
    });

    const totalDifference = totalBudget - totalActual;

    return (
        <tr>
            <th scope="col">Total</th>
            <td scope="col">{totalBudget}</td>
            <td scope="col">{totalActual}</td>
            <td scope="col">{totalDifference}</td>
        </tr>
    );
};

export default SummaryFooter;