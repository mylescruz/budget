import { Table } from "react-bootstrap";

const Transactions = () => {
    return (
        <Table striped bordered className="mt-4">
            <thead className="thead-dark">
                <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>09/29/24</td>
                    <td>Example Transaction</td>
                    <td>Example Category</td>
                    <td>$15</td>
                </tr>
                <tr>
                    <td>09/29/24</td>
                    <td>Example Transaction</td>
                    <td>Example Category</td>
                    <td>$12</td>
                </tr>
            </tbody>
        </Table>
    );
};

export default Transactions;