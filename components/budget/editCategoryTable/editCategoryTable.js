import { Button, Col, Form, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useContext, useRef, useState } from "react";
import AddCategory from "./addCategory";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import updateGuiltFreeSpending from "@/helpers/updateGuiltFreeSpending";
import usePaystubs from "@/hooks/usePaystubs";

const EditCategoryTable = ({ setEditClicked, monthInfo }) => {
    const { categories, postCategory, putCategories, deleteCategory } = useContext(CategoriesContext);
    const { getMonthIncome } = usePaystubs(monthInfo.year);
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

        const totalIncome = getMonthIncome(monthInfo);
        const updatedCategories = updateGuiltFreeSpending(totalIncome, updated);
        putCategories(updatedCategories);
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

    const addCategoryProps = {
        postCategory: postCategory,
        addCategoryClicked: addCategoryClicked,
        setAddCategoryClicked: setAddCategoryClicked
    };

    const editCategoryProps = {
        deleteCategory: deleteCategory,
        updateCategoryValues: updateCategoryValues
    };

    return (
        <>
            <Form onSubmit={updateCategoryTable}>
            <Table striped bordered responsive className="mx-auto edit-categories-table">
                <thead className="table-dark">
                    <tr>
                        <th scope="col" className="col-7 col-lg-6">
                            <Row className="alignX">
                                <Col className="col-6">Category</Col>
                                <Col className="col-2"><i className="bi bi-plus-circle-fill plus" onClick={addNewCategory}></i></Col>
                                <Col className="col-2">
                                    <Button className="btn-sm" id="save-all-btn" type="submit">Save All</Button>
                                </Col>
                            </Row>
                        </th>
                        <th scope="col" className="col-3 col-lg-2">Budget</th>
                        <th scope="col" className="col-1 col-lg-1">Color</th>
                        <th scope="col" className="col-1 col-lg-1">Delete</th>
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