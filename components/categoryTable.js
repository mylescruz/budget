import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";
import CategoryFooter from "./categoryFooter";
import React from "react";

const CategoryTable = ({categories, setEditClicked}) => {
    const handleEdit = () => {
        setEditClicked(true);
    };

    return (
        <Table striped bordered responsive className="my-4 w-100 mx-auto">
            <thead className="table-dark">
                <tr>
                    <th scope="col">
                        <Row className="alignX">
                            <Col>Category</Col>
                            <Col className="text-end px-1"><Button className="btn-sm" variant="secondary" onClick={handleEdit}>Edit</Button></Col>
                        </Row>
                    </th>
                    <th scope="col" className="col-2">Budget</th>
                    <th scope="col" className="col-2">Actual</th>
                    <th scope="col" className="col-2">Difference</th>
                </tr>
            </thead>
            <tbody>
                {categories.map(category => (
                    <CategoryRow key={category.id} category={category} />
                ))}
            </tbody>
            <tfoot>
                <CategoryFooter categories={categories} />
            </tfoot>
        </Table>
    );
};

const CategoryTableMemo = React.memo(CategoryTable);

export default CategoryTable;
export { CategoryTableMemo };