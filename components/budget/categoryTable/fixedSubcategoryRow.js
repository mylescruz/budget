import currencyFormatter from "@/helpers/currencyFormatter";

const FixedSubcategoryRow = ({ subcategory }) => {
    return (
        <tr className="d-flex">
            <th className="text-end col-6">{subcategory.name}</th>
            <td className="col-2"></td>
            <td className="col-2">{currencyFormatter.format(subcategory.actual)}</td>
            <td className="col-2"></td>
        </tr>
    );
};

export default FixedSubcategoryRow;