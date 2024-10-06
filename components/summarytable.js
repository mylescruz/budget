import { Button, Col, Row, Table } from "react-bootstrap";
import SummaryRow from "./summaryRow";
import SummaryFooter from "./summaryFooter";
import { useState } from "react";

const SummaryTable = ({categories, setCategories}) => {
    const [editClicked, setEditClicked] = useState(false);
    const [updatedCategories, setUpdatedCategories] = useState([]);

    const handleEdit = () => {
        setUpdatedCategories(categories);
        setEditClicked(!editClicked);
    };

    const handleSaveAll = () => {
        setEditClicked(!editClicked);
        setCategories(updatedCategories);
    };

    return (
        <Table striped bordered responsive className="my-4 w-100 mx-auto">
            <thead className="table-dark">
                <tr>
                    <th scope="col" className="red">Category</th>
                    <th scope="col">
                        <Row>
                            <Col>Budget</Col>
                            {!editClicked ?
                                <Col className="col-4"><Button className="btn-sm" variant="secondary" onClick={handleEdit}>Edit</Button></Col>
                                :
                                <Col className="col-5"><Button className="btn-sm text-nowrap" variant="primary" onClick={handleSaveAll}>Save All</Button></Col>
                            }
                        </Row>
                    </th>
                    <th scope="col">Actual</th>
                    <th scope="col">Difference</th>
                </tr>
            </thead>
            <tbody>
                {categories.map(category => (
                    <SummaryRow key={category.id} category={category} editClicked={editClicked} updatedCategories={updatedCategories} setUpdatedCategories={setUpdatedCategories} />
                ))}
            </tbody>
            <tfoot>
                <SummaryFooter categories={categories} />
            </tfoot>
        </Table>
    );
};

export default SummaryTable;