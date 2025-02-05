import { Table } from "react-bootstrap";
import currencyFormatter from "@/helpers/currencyFormatter";
import Link from "next/link";
import styles from "@/styles/historyTable.module.css";

const HistoryTable = ({ history }) => {
    return (
        <Table bordered hover className={`w-75 mx-auto ${styles.table}`}>
            <thead className="table-dark">
                <tr>
                    <th scope="col">Month</th>
                    <th scope="col">Budget</th>
                    <th scope="col">Actual</th>
                    <th scope="col">Leftover</th>
                </tr>
            </thead>
            <tbody>
                {history.map(month => (
                    <tr key={month.id} className={styles.cell}>
                        <td><Link href={{pathname:'/history/[month]', query: {month: month.month, year: month.year}}}>{month.month} {month.year}</Link></td>
                        <td>{currencyFormatter.format(month.budget)}</td>
                        <td>{currencyFormatter.format(month.actual)}</td>
                        {month.leftover >= 0 ? 
                        <td>{currencyFormatter.format(month.leftover)}</td>
                        :
                        <td className="text-danger">{currencyFormatter.format(month.leftover)}</td>}
                    </tr>
                ))}                
            </tbody>
        </Table>
    );
};

export default HistoryTable;