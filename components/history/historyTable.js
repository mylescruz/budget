import { Table } from "react-bootstrap";
import currencyFormatter from "@/helpers/currencyFormatter";
import Link from "next/link";
import monthFormatter from "@/helpers/monthFormatter";

const HistoryTable = ({ history }) => {
    return (
        <Table bordered hover className={"w-75 mx-auto history-table"}>
            <caption>*Click a month to view its budget</caption>
            <thead className="table-dark">
                <tr>
                    <th>Month</th>
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