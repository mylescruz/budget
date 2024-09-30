import { Table } from "react-bootstrap";

const TransactionsTable = () => {
    return (
        <Table striped bordered className="mt-4">
            <thead className="thead-dark">
                <tr>
                <th scope="col">Date</th>
                <th scope="col">Store</th>
                <th scope="col">Items Purchased</th>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>09/29/24</td>
                    <td>Example Store</td>
                    <td>Example Description</td>
                    <td>Example Category</td>
                    <td>$15</td>
                </tr>
            </tbody>
        </Table>
    );
};

export default TransactionsTable;