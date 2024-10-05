import { Button, Col, Row, Table } from "react-bootstrap";
import SummaryRow from "./summaryRow";
import SummaryFooter from "./summaryFooter";
import { useState } from "react";

const SummaryTable = ({transactions, categories, setCategories}) => {
    const [editClicked, setEditClicked] = useState(false);
    const [saveClicked, setSaveClicked] = useState(false);
    const [updatedCategoryBudgets, setUpdatedCategoryBudgets] = useState([]);
    const [updatedCategoryColors, setUpdatedCategoryColors] = useState([]);

    const handleEditClicked = () => {
        setUpdatedCategoryBudgets(categories);
        setUpdatedCategoryColors(categories);
        setEditClicked(!editClicked);
        setSaveClicked(!saveClicked);
    };

    const handleSaveClicked = () => {
        setSaveClicked(!saveClicked);
        setEditClicked(!editClicked);
        setCategories(updatedCategoryBudgets);
        setCategories(updatedCategoryColors);
    };

    return (
        <Table striped bordered responsive className="my-4 w-75 mx-auto">
            <thead className="table-dark">
                <tr>
                    <th scope="col" className="red">Category</th>
                    <th scope="col">
                        <Row>
                            <Col>Budget</Col>
                            {!editClicked ?
                                <Col className="col-4"><Button className="btn-sm" variant="secondary" onClick={handleEditClicked}>Edit</Button></Col>
                                :
                                <Col className="col-5"><Button className="btn-sm text-nowrap" variant="primary" onClick={handleSaveClicked}>Save All</Button></Col>
                            }
                        </Row>
                    </th>
                    <th scope="col">Actual</th>
                    <th scope="col">Difference</th>
                </tr>
            </thead>
            <tbody>
                {categories.map(category => (
                    <SummaryRow key={category.id} category={category} transactions={transactions} editClicked={editClicked} updatedCategoryBudgets={updatedCategoryBudgets} setUpdatedCategoryBudgets={setUpdatedCategoryBudgets} updatedCategoryColors={updatedCategoryColors} setUpdatedCategoryColors={setUpdatedCategoryColors}/>
                ))}
            </tbody>
            <tfoot>
                <SummaryFooter categories={categories} transactions={transactions} />
            </tfoot>
        </Table>
    );
};

export default SummaryTable;