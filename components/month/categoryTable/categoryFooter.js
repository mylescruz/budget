import { CategoriesContext } from "@/contexts/CategoriesContext";
import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import dateInfo from "@/helpers/dateInfo";
import usePaystubs from "@/hooks/usePaystubs";
import { useContext, useMemo } from "react";

const CategoryFooter = () => {   
    const { categories } = useContext(CategoriesContext); 
    const { paystubs } = usePaystubs(dateInfo.currentYear);
    
    const footerValues = useMemo(() => {
        let totalBudget = 0;
        paystubs.map(paystub => {
            const paystubDate = new Date(dateFormatter(paystub.date));
            const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long'});
            if (paystubMonth === dateInfo.currentMonth)
                totalBudget += paystub.net;
        });

        let totalActual = 0;
        categories.forEach(category => {
            totalActual += category.actual;
        });

        return {budget: totalBudget, actual: totalActual};
    }, [categories, paystubs]);

    const totalDifference = footerValues.budget - footerValues.actual;

    return (
        <tr>
            <th scope="col" className="bg-dark text-white">Total</th>
            <td scope="col" className="bg-dark text-white">{currencyFormatter.format(footerValues.budget)}</td>
            <td scope="col" className="bg-dark text-white">{currencyFormatter.format(footerValues.actual)}</td>
            <td scope="col" className="bg-dark text-white">
                {totalDifference > 0 ? 
                    <span className="text-white">{currencyFormatter.format(totalDifference)}</span> 
                    : 
                    <span className="text-danger fw-bold">({currencyFormatter.format(totalDifference)})</span>
                }
            </td>
        </tr>
    );
};

export default CategoryFooter;