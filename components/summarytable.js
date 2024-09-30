import spendingCategories from "@/helpers/spendingcategories";
import { Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";

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
                    {spendingCategories.map((category) => (
                        <CategoryRow key={category} category={category} />
                    ))}
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