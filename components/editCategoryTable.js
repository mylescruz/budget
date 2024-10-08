import { Button, Col, Form, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useState } from "react";

const EditCategoryTable = ({ categories, setCategories, setEditClicked }) => {
    const [updatedCategories, setUpdatedCategories] = useState(categories);

    const updateCategoryTable = (e) => {
        e.preventDefault();

        setEditClicked(false);
        setCategories(updatedCategories);
    };

    const removeCategory = (categoryToRemove) => {
        const remainingCategories = updatedCategories.filter(category => {
            return category.id !== categoryToRemove.id;
        });

        setUpdatedCategories(remainingCategories);
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
                        <th scope="col" className="col-2">Budget</th>
                        <th scope="col" className="col-1">Color</th>
                        <th scope="col" className="col-1">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {updatedCategories.map(category => (
                        <EditCategoryRow key={category.id} category={category} updatedCategories={updatedCategories} setUpdatedCategories={setUpdatedCategories} removeCategory={removeCategory}/>
                    ))}
                </tbody>
            </Table>
            </Form>
        </>
    );
};

export default EditCategoryTable;