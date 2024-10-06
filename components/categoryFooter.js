import currencyFormatter from "@/helpers/currencyFormatter";

const CategoryFooter = ({ categories }) => {
    let totalBudget = 0;
    let totalActual = 0;
    
    categories.forEach(category => {
        totalBudget += category.budget;
        totalActual += category.actual;
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

export default CategoryFooter;