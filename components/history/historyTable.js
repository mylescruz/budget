import useHistory from "@/hooks/useHistory";
import { Table } from "react-bootstrap";

const HistoryTable = () => {
    const { history } = useHistory();

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
                        <td>{month.budget}</td>
                        <td>{month.actual}</td>
                        <td>{month.leftover}</td>
                    </tr>
                ))}                
            </tbody>
        </Table>
    );
};

export default HistoryTable;