import { CategoriesContext } from "@/contexts/CategoriesContext";
import currencyFormatter from "@/helpers/currencyFormatter";
import { useContext, useMemo } from "react";

const CategoryFooter = () => {   
    const { categories } = useContext(CategoriesContext); 
    
    const footerValues = useMemo(() => {
        let totalBudget = 0;
        let totalActual = 0;

        categories.forEach(category => {
            totalBudget += category.budget;
            totalActual += category.actual;
        });

        return {budget: totalBudget, actual: totalActual};
    }, [categories]);

    const totalDifference = footerValues.budget - footerValues.actual;

    return (
        <tr>
            <th scope="col" className="bg-secondary text-white">Total</th>
            <td scope="col" className="bg-secondary text-white">{currencyFormatter.format(footerValues.budget)}</td>
            <td scope="col" className="bg-secondary text-white">{currencyFormatter.format(footerValues.actual)}</td>
            <td scope="col" className="bg-secondary text-white">{currencyFormatter.format(totalDifference)}</td>
        </tr>
    );
};

export default CategoryFooter;