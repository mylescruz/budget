import { Table } from "react-bootstrap";
import currencyFormatter from "@/helpers/currencyFormatter";

const HistoryTable = ({ history }) => {
    return (
        <Table bordered className="w-75 mx-auto">
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
                    <tr key={month.id}>
                        <td>{month.month} {month.year}</td>
                        <td>{currencyFormatter.format(month.budget)}</td>
                        <td>{currencyFormatter.format(month.actual)}</td>
                        <td>{currencyFormatter.format(month.leftover)}</td>
                    </tr>
                ))}                
            </tbody>
        </Table>
    );
};

export default HistoryTable;