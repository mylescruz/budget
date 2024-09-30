import categories from "@/helpers/categories";
import { Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";
import SummaryFooter from "./summaryFooter";

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
                    {categories.map(category => (
                        <CategoryRow key={category.id} category={category}/>
                    ))}
                </tbody>
                <tfoot>
                    <SummaryFooter categories={categories} />
                </tfoot>
            </Table>
        </>
    );
};

export default SummaryTable;