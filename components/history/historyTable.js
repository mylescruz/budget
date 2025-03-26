import { Table } from "react-bootstrap";
import currencyFormatter from "@/helpers/currencyFormatter";
import Link from "next/link";
import monthFormatter from "@/helpers/monthFormatter";
import PopUp from "../layout/popUp";

const HistoryTable = ({ history }) => {
    return (
        <Table bordered hover className="mx-auto history-table">
            <thead className="table-dark">
                <tr>
                    <th>
                        Month
                        <PopUp title="Click a month to view its budget." id="history-info">
                            <span> &#9432;</span>
                        </PopUp>
                    </th>
                    <th>Budget</th>
                    <th>Actual</th>
                    <th>Leftover</th>
                </tr>
            </thead>
            <tbody>
                {history.map(month => (
                    <tr key={month.id}>
                        <td className="click"><Link href={{pathname:'/history/[month]', query: {month: month.month, year: month.year}}}>{monthFormatter(`${month.month} 01, ${month.year}`)}</Link></td>
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