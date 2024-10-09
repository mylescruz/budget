import { Button, Col, Form, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useState } from "react";
import AddCategory from "./addCategory";

const EditCategoryTable = ({ categories, setCategories, setEditClicked }) => {
    const [updatedCategories, setUpdatedCategories] = useState(categories);
    const [addCategoryClicked, setAddCategoryClicked] = useState(false);

    const updateCategoryTable = (e) => {
        e.preventDefault();

        setEditClicked(false);
        setCategories(updatedCategories);
    };

    const addCategory = () => {
        setAddCategoryClicked(true);
    };

    const addToCategories = (newCategory) => {
        console.log(newCategory);
        setUpdatedCategories([...updatedCategories, newCategory]);
    };

    const removeCategory = (categoryToRemove) => {
        const remainingCategories = updatedCategories.filter(category => {
            return category.id !== categoryToRemove.id;
        });

        setUpdatedCategories(remainingCategories);
    };

    const addCategoryModal = <AddCategory updatedCategories={updatedCategories} addToCategories={addToCategories} addCategoryClicked={addCategoryClicked} setAddCategoryClicked={setAddCategoryClicked} />;

    return (
        <>
            <Form onSubmit={updateCategoryTable}>
            <Table striped bordered responsive className="my-4 w-100 mx-auto">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">
                            <Row className="alignX">
                                <Col>Category <i className="bi bi-plus-circle-fill plus px-3" onClick={addCategory}></i></Col>
                                {/* <Col className="plus text-start"></Col> */}
                                <Col className="text-end px-1">
                                    <Button className="btn-sm text-nowrap" variant="primary" type="submit">Save All</Button>
                                </Col>
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

            {addCategoryClicked && <>{addCategoryModal}</>}
        </>
    );
};

export default EditCategoryTable;