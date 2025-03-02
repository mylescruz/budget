import currencyFormatter from "@/helpers/currencyFormatter";
import { useState } from "react";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import SubcategoryRow from "./subcategoryRow";
const guiltFree = "Guilt Free Spending";

const PopUp = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span>{children}</span>
    </OverlayTrigger>
);

const CategoryRow = ({ category }) => {
    const hasSubcategory = category.hasSubcategory;
    const [showSubcategories, setShowSubcategories] = useState(false);    
    
    const dropdownSubcategories = () => {
        setShowSubcategories(!showSubcategories);
    };

    const difference = parseFloat((category.budget - category.actual).toFixed(2));
    return (
        <>
            <tr className="d-flex">
                <th className="col-6">
                    <Row>
                        <Col xs={9} sm={10} className="cell">
                            {category.name}
                            {category.name === guiltFree &&
                                <PopUp title="The money you can spend on whatever you want after all other expenses have been covered" id="t-1">
                                    <span> &#9432;</span>
                                </PopUp>
                            }
                        </Col>
                        {hasSubcategory && 
                        <Col xs={3} sm={2}>
                            {showSubcategories ? 
                                <i className="bi bi-chevron-up" onClick={dropdownSubcategories}></i>
                                :
                                <i className="bi bi-chevron-down" onClick={dropdownSubcategories}></i>
                            }
                        </Col>
                        }
                    </Row>
                </th>
                <td className={`col-2 cell ${category.budget < 0 ? "text-danger fw-bold" : "fw-bold"}`}>{currencyFormatter.format(category.budget)}</td>
                <td className={"col-2 cell"}>{currencyFormatter.format(category.actual)}</td>
                <td className={`col-2 cell ${difference < 0 ? "text-danger fw-bold" : ""}`}>{currencyFormatter.format(difference)}</td>
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