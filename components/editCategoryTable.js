import { Button, Col, Form, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useState } from "react";

const EditCategoryTable = ({ categories, setCategories, setEditClicked }) => {
    const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);
    const [updatedCategories, setUpdatedCategories] = useState(categories);

    const updateCategoryTable = (e) => {
        e.preventDefault();

        setEditClicked(false);
        setCategories(updatedCategories);
    };

    return (
        <>
            <Form onSubmit={updateCategoryTable}>
            <Table striped bordered responsive className="my-4 w-100 mx-auto">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">
                            <Row>
                                <Col className="col-8">Category</Col>
                                <Col className="col-4"><Button className="btn-sm text-nowrap" variant="primary" type="submit">Save All</Button></Col>
                            </Row>
                        </th>
                        <th scope="col" className="col-3">Budget</th>
                        <th scope="col" className="col-2">Color</th>
                        <th scope="col" className="col-2">Subcategory</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(category => (
                        <EditCategoryRow key={category.id} category={category} setAddSubcategoryClicked={setAddSubcategoryClicked} updatedCategories={updatedCategories} setUpdatedCategories={setUpdatedCategories} />
                    ))}
                </tbody>
            </Table>
            </Form>
        </>
    );
};

export default EditCategoryTable;