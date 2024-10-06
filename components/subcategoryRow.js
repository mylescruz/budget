import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/subcategoryRow.module.css";

const SubcategoryRow = ({ subcategory }) => {

    const difference = subcategory.budget - subcategory.actual;

    return (
        <tr>
            <th className={styles.cell}>{subcategory.name}</th>
            <td>{currencyFormatter.format(subcategory.budget)}</td>
            <td>{currencyFormatter.format(subcategory.actual)}</td>
            <td className={difference < 0 ? "text-danger font-weight-bold" : ""}>{currencyFormatter.format(difference)}</td>
        </tr>
    );
};

export default SubcategoryRow;