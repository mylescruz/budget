import { Button, Col, Form, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useRef, useState } from "react";
import AddCategory from "./addCategory";

const EditCategoryTable = ({ categories, setCategories, setEditClicked }) => {
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

        setCategories(updated);
    };

    const updateCategoryValues = (category, property, input) => {   
        const foundIndex = categoryValues.current.findIndex(cat => {
            return cat.id === category.id;
        });

        let budgetValue = parseFloat(input);
        if (isNaN(budgetValue))
            budgetValue = 0;

        if (foundIndex !== -1) {
            const updatedValues = categoryValues.current[foundIndex];
            if (property === 'budget') {
                categoryValues.current[foundIndex] = {...updatedValues, [property]: budgetValue};
            } else {
                categoryValues.current[foundIndex] = {...updatedValues, [property]: input};
            }
        } else {
            if (property === 'budget') {
                categoryValues.current.push({...category, [property]: budgetValue});
            } else {
                categoryValues.current.push({...category, [property]: input});
            }
        }
    };

    const addCategory = () => {
        setAddCategoryClicked(true);
    };

    const addToCategories = (newCategory) => {
        setCategories([...categories, newCategory]);
    };

    const removeCategory = (categoryToRemove) => {
        const remainingCategories = categories.filter(category => {
            return category.id !== categoryToRemove.id;
        });

        setCategories(remainingCategories);
    };

    const addCategoryModal = <AddCategory categories={categories} addToCategories={addToCategories} addCategoryClicked={addCategoryClicked} setAddCategoryClicked={setAddCategoryClicked} />;

    return (
        <>
            <Form onSubmit={updateCategoryTable}>
            <Table striped bordered responsive className="my-4 w-100 mx-auto">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">
                            <Row className="alignX">
                                <Col>Category <i className="bi bi-plus-circle-fill plus px-3" onClick={addCategory}></i></Col>
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
                    {categories.map(category => (
                        <EditCategoryRow key={category.id} category={category} categories={categories} setCategories={setCategories} removeCategory={removeCategory} updateCategoryValues={updateCategoryValues}/>
                    ))}
                </tbody>
            </Table>
            </Form>

            {addCategoryClicked && <>{addCategoryModal}</>}
        </>
    );
};

export default EditCategoryTable;