import { Table } from "react-bootstrap";

const SummaryTable = () => {
    return (
        <>
            <h4 className="text-center">Summary by Category</h4>
            <Table striped bordered className="my-4">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">Category</th>
                        <th scope="col">Budget</th>
                        <th scope="col">Actual</th>
                        <th scope="col">Difference</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">Category 1</th>
                        <td>$100</td>
                        <td>$90</td>
                        <td>$10</td>
                    </tr>
                    <tr>
                        <th scope="row">Category 2</th>
                        <td>$150</td>
                        <td>$120</td>
                        <td>$30</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th scope="col">Total</th>
                        <td scope="col"></td>
                        <td scope="col"></td>
                        <td scope="col"></td>
                    </tr>
                </tfoot>
            </Table>
        </>
    );
};

export default SummaryTable;