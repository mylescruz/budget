import currencyFormatter from "@/helpers/currencyFormatter";

const CategoryFooter = ({footerValues}) => {   
    const totalDifference = footerValues.budget - footerValues.actual;

    return (
        <tr className="d-flex">
            <th className={"col-6 bg-dark text-white cell"}>Total</th>
            <td className={"col-2 bg-dark text-white cell"}>{currencyFormatter.format(footerValues.budget)}</td>
            <td className={"col-2 bg-dark text-white cell"}>{currencyFormatter.format(footerValues.actual)}</td>
            <td className={"col-2 bg-dark text-white cell"}>
                {totalDifference > 0 ? 
                    <span className="text-white">{currencyFormatter.format(totalDifference)}</span> 
                    : 
                    <span className="text-danger fw-bold">-{currencyFormatter.format(Math.abs(totalDifference))}</span>
                }
            </td>
        </tr>
    );
};

export default CategoryFooter;