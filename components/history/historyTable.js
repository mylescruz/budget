import { Table } from "react-bootstrap";

const HistoryTable = () => {
    return (
        <Table bordered className="w-75 mx-auto">
            <thead className="table-dark">
                <tr>
                    <th scope="col">Month</th>
                    <th scope="col">Budget</th>
                    <th scope="col">Actual</th>
                    <th scope="col">Difference</th>
                </tr>
            </thead>
            <tbody>
                
            </tbody>
        </Table>
    );
};

export default HistoryTable;