import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";
import CategoryFooter from "./categoryFooter";
import React, { useContext, useEffect, useMemo } from "react";
import FixedCategoryRow from "./fixedCategoryRow";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import useIncome from "@/hooks/useIncome";
import useHistory from "@/hooks/useHistory";
import updateGuiltFreeSpending from "@/helpers/updateGuiltFreeSpending";
import { useSession } from "next-auth/react";
import PopUp from "@/components/layout/popUp";

const CategoryTable = ({ setEditClicked, monthInfo }) => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    const { categories, categoriesLoading, putCategories } = useContext(CategoriesContext);
    const { income, incomeLoading, getMonthIncome } = useIncome(session.user.username, monthInfo.year);
    const { historyLoading, putHistory, getMonthHistory } = useHistory(session.user.username);

    // Updates the budget and the money actual spent in the history array when the categories array changes
    useEffect(() => {
        const updateHistoryValues = async () => {
            let totalActual = 0;
            categories.forEach(category => {
                totalActual += parseFloat(category.actual);
            });

            const foundMonth = getMonthHistory(monthInfo);

            // Updates the given month's actual and leftover value by sending a PUT request to the API
            if (foundMonth) {
                foundMonth.actual = parseFloat(totalActual.toFixed(2));
                foundMonth.leftover = parseFloat((foundMonth.budget - totalActual).toFixed(2));

                putHistory(foundMonth);
            }
        };

        if (!categoriesLoading && !historyLoading) {
            updateHistoryValues();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]);

    // Updates the Guilt Free Spending budget when the income array changes
    useEffect(() => {
        if (!incomeLoading && !categoriesLoading) {
            const income = getMonthIncome(monthInfo);

            // Updates the categories by sending a PUT request to the API
            const updatedCategories = updateGuiltFreeSpending(income, categories);
            putCategories(updatedCategories);
        }
            
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [income]);

    // Sets the table's total budget and actual spent values
    const footerValues = useMemo(() => {
        let totalActual = 0;
        categories.forEach(category => {
            totalActual += parseFloat(category.actual);
        });

        const income = getMonthIncome(monthInfo);

        return {budget: income, actual: totalActual};
    }, [categories, getMonthIncome, monthInfo]);

    const handleEdit = () => {
        setEditClicked(true);
    };

    return (
        <Table bordered className="categories-table mx-auto">
            <thead className="table-dark">
                <tr className="d-flex">
                    <th className="col-6">
                        <Row className="alignX">
                            <Col xs={9} sm={9} md={9}>
                                Category
                                <PopUp title="You can edit and add categories and their subcategories. You can also edit their budget and color." id="categories-info">
                                    <span> &#9432;</span>
                                </PopUp>
                            </Col>
                            <Col xs={2} sm={2} md={2}><Button className="btn-sm" id="edit-categories-btn" variant="secondary" onClick={handleEdit}>Edit</Button></Col>
                        </Row>
                    </th>
                    <th className={"col-2 cell"}>Budget</th>
                    <th className={"col-2 cell"}>Actual</th>
                    <th className={"col-2 cell"}>Leftover</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th className="bg-secondary text-white" colSpan={1}>
                        Fixed Expenses
                        <PopUp title="Your expenses that remain the same each month." id="fixed-expenses-info">
                            <span> &#9432;</span>
                        </PopUp>
                    </th>
                </tr>
                {categories.map(category => (
                    (category.fixed && <FixedCategoryRow key={category.id} category={category} />)
                ))}
                <tr>
                    <th className="bg-secondary text-white" colSpan={1}>
                        Variable Expenses
                        <PopUp title="Your expenses that change depending on your spending." id="variable-expenses-info">
                            <span> &#9432;</span>
                        </PopUp>
                    </th>
                </tr>
                {categories.map(category => (
                    (!category.fixed && <CategoryRow key={category.id} category={category} />)
                ))}
            </tbody>
            <tfoot>
                <CategoryFooter footerValues={footerValues}/>
            </tfoot>
        </Table>
    );
};

export default CategoryTable;