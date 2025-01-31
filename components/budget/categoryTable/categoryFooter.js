import currencyFormatter from "@/helpers/currencyFormatter";

const CategoryFooter = ({footerValues}) => {   
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
                    <span className="text-danger fw-bold">({currencyFormatter.format(Math.abs(totalDifference))})</span>
                }
            </td>
        </tr>
    );
};

export default CategoryFooter;