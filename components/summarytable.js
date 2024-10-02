import { Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";
import SummaryFooter from "./summaryFooter";

const SummaryTable = ({transactions, categories}) => {
    return (
        <Table striped bordered responsive="sm" className="my-4 w-75 mx-auto">
            <thead className="thead-dark">
                <tr>
                    <th scope="col" className="red">Category</th>
                    <th scope="col">Budget</th>
                    <th scope="col">Actual</th>
                    <th scope="col">Difference</th>
                </tr>
            </thead>
            <tbody>
                {categories.map(category => (
                    <CategoryRow key={category.id} category={category} transactions={transactions}/>
                ))}
            </tbody>
            <tfoot>
                <SummaryFooter categories={categories} transactions={transactions} />
            </tfoot>
        </Table>
    );
};

export default SummaryTable;