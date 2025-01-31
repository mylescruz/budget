import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/categoryRow.module.css";
import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import SubcategoryRow from "./subcategoryRow";

const CategoryRow = ({ category }) => {
    const hasSubcategory = category.hasSubcategory;
    const [showSubcategories, setShowSubcategories] = useState(false);    
    
    const dropdownSubcategories = () => {
        setShowSubcategories(!showSubcategories);
    };

    const difference = category.budget - category.actual;
    return (
        <>
            <tr>
                <th scope="row">
                    <Row>
                        <Col className={`col-9 ${styles.cell}`}>{category.name}</Col>
                        {hasSubcategory && 
                        <Col className="col-3">
                            {showSubcategories ? 
                                <i className="bi bi-chevron-up" onClick={dropdownSubcategories}></i>
                                :
                                <i className="bi bi-chevron-down" onClick={dropdownSubcategories}></i>
                            }
                        </Col>
                        }
                    </Row>
                </th>
                <td className={category.budget < 0 ? "text-danger fw-bold" : styles.budgetRow}>{currencyFormatter.format(category.budget)}</td>
                <td>{currencyFormatter.format(category.actual)}</td>
                <td className={difference < 0 ? "text-danger fw-bold" : ""}>{currencyFormatter.format(difference)}</td>
            </tr>
            {showSubcategories &&
                category.subcategories.map(subcategory => (
                    <SubcategoryRow key={subcategory.id} subcategory={subcategory} />
                ))
            }
        </>
    );
};

export default CategoryRow;