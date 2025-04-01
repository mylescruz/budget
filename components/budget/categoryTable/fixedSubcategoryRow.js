import currencyFormatter from "@/helpers/currencyFormatter";

const FixedSubcategoryRow = ({ subcategory }) => {
    return (
        <tr className="d-flex">
            <th className="col-6 cell text-end">{subcategory.name}</th>
            <td className="d-none d-md-block col-md-2"></td>
            <td className="col-3 col-md-2 text-center fw-bold">{currencyFormatter.format(subcategory.actual)}</td>
            <td className="col-3 col-md-2"></td>
        </tr>
    );
};

export default FixedSubcategoryRow;