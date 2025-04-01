import { Button, Col, Form, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useContext, useRef, useState } from "react";
import AddCategory from "./addCategory";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import updateGuiltFreeSpending from "@/helpers/updateGuiltFreeSpending";
import useIncome from "@/hooks/useIncome";
import { useSession } from "next-auth/react";

const EditCategoryTable = ({ setEditClicked, monthInfo }) => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    const { categories, postCategory, putCategories, deleteCategory } = useContext(CategoriesContext);
    const { getMonthIncome } = useIncome(session.user.username, monthInfo.year);
    const [addCategoryClicked, setAddCategoryClicked] = useState(false);

    /* 
        categoryValues is a reference array set up to update all the categories at the same time
        It needs to survive the re-renders that occur each time a category changes
    */
    const categoryValues = useRef([]);

    const updateCategoryTable = (e) => {
        e.preventDefault();

        setEditClicked(false);

        // If any category was edited, make a PUT request to the categories API endpoint
        if (categoryValues.current.length > 0) {
            // Maps through the categories array and if the category matches an editted category in categoryValues, replace that category
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

            // Updates the categories array with the editted categories by sending a PUT request to the API
            putCategories(updatedCategories);
        }
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
                <Table striped bordered className="mx-auto">
                    <thead>
                        <tr className="table-dark d-flex">
                            <th className="col-7 col-md-8">Category <Button className="btn-sm mx-lg-2" id="save-all-btn" onClick={addNewCategory}>Add New</Button></th>
                            <th className="col-3 col-md-2">Budget</th>
                            <th className="col-2 col-md-2">Color</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th className="bg-secondary text-white" colSpan={1}>Fixed Expenses</th>
                        </tr>
                        {categories.map(category => (
                            (category.fixed && <EditCategoryRow key={category.id} category={category} {...editCategoryProps} />)
                        ))}
                        <tr>
                            <th className="bg-secondary text-white" colSpan={1}>Changing Expenses</th>
                        </tr>
                        {categories.map(category => (
                            (!category.fixed && <EditCategoryRow key={category.id} category={category} {...editCategoryProps} />)
                        ))}
                    </tbody>
                </Table>

                <Row>
                    <Col className="text-end">
                        <Button id="save-all-btn" type="submit">Save Changes</Button>
                    </Col>
                </Row>
            </Form>

            {addCategoryClicked && <AddCategory {...addCategoryProps} />}
        </>
    );
};

export default EditCategoryTable;