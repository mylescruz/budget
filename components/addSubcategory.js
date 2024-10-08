import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import styles from "@/styles/addSubcategory.module.css";

const AddSubcategory = ({ category, categories, setUpdatedCategories, setAddSubcategoryClicked }) => {
    const emptySubcategory = {
        id: 0,
        name: "",
        actual: 0,
        parent: category.name
    };

    const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);

    const handleInput = (e) => {
        setNewSubcategory({ ...newSubcategory, [e.target.id]: e.target.value});
    };

    const cancelAddSubcategory = () => {
        setAddSubcategoryClicked(false);
    };

    const addToCategories = (e) => {
        e.preventDefault();

        if (newSubcategory.name === '')
            return;

        let maxID = 0;
        if (category.hasSubcategory)
            maxID = Math.max(...category.subcategories.map(subCategory => subCategory.id));

        const newID = maxID + 1;
        setNewSubcategory({...newSubcategory, id: newID})

        const updatedCategories = categories.map(oldCategory => {
            if (oldCategory.id === category.id) {
                return {
                    ...oldCategory,
                    hasSubcategory: true,
                    subcategories: [
                        ...oldCategory.subcategories,
                        {...newSubcategory, id: newID}
                    ]
                }
            } else {
                return oldCategory;
            }
            
        });

        setUpdatedCategories(updatedCategories);
        setAddSubcategoryClicked(false);
    };

    return (
        <tr>
            <td>
                <Row className={styles.align}>
                    <Col className="col-9">
                        <Form.Group className="formInput">
                            <Form.Control
                            id="name"
                            className="h-100"
                            type="text"
                            placeholder="Name"
                            value={newSubcategory.name}
                            onChange={handleInput}
                            />
                        </Form.Group>
                    </Col>
                    <Col className="col-1">
                        <i className={`bi bi-x-circle ${styles.cancel}`} onClick={cancelAddSubcategory}></i>
                    </Col>
                    <Col className="col-1">
                        <i className={`bi bi-check-circle ${styles.check}`} onClick={addToCategories}></i>
                    </Col>
                </Row>
            </td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    )
};

export default AddSubcategory;