import currencyFormatter from "@/helpers/currencyFormatter";

const SubcategoryRow = ({ subcategory }) => {
    return (
        <tr>
            <th className="text-end">{subcategory.name}</th>
            <td></td>
            <td>{currencyFormatter.format(subcategory.actual)}</td>
            <td></td>
        </tr>
    );
};

export default SubcategoryRow;