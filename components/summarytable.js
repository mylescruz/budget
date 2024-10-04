import { Button, Col, Row, Table } from "react-bootstrap";
import SummaryRow from "./summaryRow";
import SummaryFooter from "./summaryFooter";
import { useState } from "react";

const SummaryTable = ({transactions, categories, setCategories}) => {
    const [budgetClicked, setBudgetClicked] = useState(false);
    const [budgetButtonText, setBudgetButtonText] = useState("Edit");

    const toggleEditBudget = () => {
        if (budgetClicked) {
            setBudgetClicked(false);
            setBudgetButtonText("Edit");
        } else {
            setBudgetClicked(true);
            setBudgetButtonText("Save All");
        }
    };

    return (
        <Table striped bordered responsive="sm" className="my-4 w-75 mx-auto">
            <thead className="table-dark">
                <tr>
                    <th scope="col" className="red">Category</th>
                    <th scope="col">
                        <Row>
                            <Col>Budget</Col>
                            <Col className={budgetClicked ? "col-4" : "col-3"}><Button className="btn-sm text-nowrap" variant="secondary" onClick={toggleEditBudget}>{budgetButtonText}</Button></Col>
                        </Row>
                    </th>
                    <th scope="col">Actual</th>
                    <th scope="col">Difference</th>
                </tr>
            </thead>
            <tbody>
                {categories.map(category => (
                    <SummaryRow key={category.id} category={category} transactions={transactions} setCategories={setCategories} budgetClicked={budgetClicked} />
                ))}
            </tbody>
            <tfoot>
                <SummaryFooter categories={categories} transactions={transactions} />
            </tfoot>
        </Table>
    );
};

export default SummaryTable;