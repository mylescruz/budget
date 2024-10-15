import { Button, Col, Form, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useContext, useRef, useState } from "react";
import AddCategory from "./addCategory";
import { CategoriesContext } from "@/contexts/CategoriesContext";

const EditCategoryTable = ({ setEditClicked }) => {
    const { categories, addCategory, updateCategories } = useContext(CategoriesContext);
    const [addCategoryClicked, setAddCategoryClicked] = useState(false);
    const categoryValues = useRef([]);

    const updateCategoryTable = (e) => {
        e.preventDefault();

        setEditClicked(false);

        const updated = categories.map(category => {
            const foundIndex = categoryValues.current.findIndex(cat => {
                return cat.id === category.id;
            });

            if (foundIndex !== -1) {
                return categoryValues.current[foundIndex];
            } else {
                return category;
            }
        });

        updateCategories(updated);
    };

    const updateCategoryValues = (updatedCategory) => {
        const foundIndex = categoryValues.current.findIndex(category => {
            return category.id === updatedCategory.id;
        });

        if (foundIndex !== -1) {
            categoryValues.current[foundIndex] = updatedCategory;
        } else {
            categoryValues.current.push(updatedCategory);
        }
    };

    const addNewCategory = () => {
        setAddCategoryClicked(true);
    };

    const addToCategories = (newCategory) => {
        addCategory(newCategory);
    };

    const removeCategory = (categoryToRemove) => {
        const remainingCategories = categories.filter(category => {
            return category.id !== categoryToRemove.id;
        });

        updateCategories(remainingCategories);
    };

    const addCategoryProps = {
        addToCategories: addToCategories,
        addCategoryClicked: addCategoryClicked,
        setAddCategoryClicked: setAddCategoryClicked
    };

    const editCategoryProps = {
        removeCategory: removeCategory,
        updateCategoryValues: updateCategoryValues
    };

    return (
        <>
            <Form onSubmit={updateCategoryTable}>
            <Table striped bordered responsive className="my-4 w-100 mx-auto">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">
                            <Row className="alignX">
                                <Col>Category <i className="bi bi-plus-circle-fill plus px-3" onClick={addNewCategory}></i></Col>
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
                    <tr>
                        <th className="bg-secondary text-white" colSpan={4}>Fixed Expenses</th>
                    </tr>
                    {categories.map(category => (
                        (category.fixed && <EditCategoryRow key={category.id} category={category} {...editCategoryProps} />)
                    ))}
                    <tr>
                        <th className="bg-secondary text-white" colSpan={4}>Other Expenses</th>
                    </tr>
                    {categories.map(category => (
                        (!category.fixed && <EditCategoryRow key={category.id} category={category} {...editCategoryProps} />)
                    ))}
                </tbody>
            </Table>
            </Form>

            {addCategoryClicked && <AddCategory {...addCategoryProps} />}
        </>
    );
};

export default EditCategoryTable;