import currencyFormatter from "@/helpers/currencyFormatter";
import styles from "@/styles/categoryRow.module.css";
import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import FixedSubcategoryRow from "./fixedSubcategoryRow";

const FixedCategoryRow = ({ category }) => {
    const hasSubcategory = category.hasSubcategory;
    const [showSubcategories, setShowSubcategories] = useState(false);    

    const dropdownSubcategories = () => {
        setShowSubcategories(!showSubcategories);
    };

    const difference = category.budget - category.actual;
    return (
        <>
            <tr>
                <th scope="row" className={styles.cell}>
                    <Row>
                        <Col>{category.name}
                            {hasSubcategory && 
                            (showSubcategories ? 
                                <i className="bi bi-chevron-up mx-1" onClick={dropdownSubcategories}></i>
                                :
                                <i className="bi bi-chevron-down mx-1" onClick={dropdownSubcategories}></i>
                            )
                        }
                        </Col>
                    </Row>
                </th>
                <td className={styles.budgetRow}>{currencyFormatter.format(category.budget)}</td>
                <td>{currencyFormatter.format(category.actual)}</td>
                <td className={difference < 0 ? "text-danger font-weight-bold" : ""}>{currencyFormatter.format(difference)}</td>
            </tr>
            {showSubcategories &&
                category.subcategories.map(subcategory => (
                    <FixedSubcategoryRow key={subcategory.id} subcategory={subcategory} />
                ))
            }
        </>
    );
};

export default FixedCategoryRow;