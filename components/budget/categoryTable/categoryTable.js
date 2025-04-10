import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";
import CategoryFooter from "./categoryFooter";
import React, { useContext, useEffect, useMemo, useState } from "react";
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

    const [showFixedExpenses, setShowFixedExpenses] = useState(true);
    const [showVariableExpenses, setShowVariableExpenses] = useState(true);
    const { categories, categoriesLoading, putCategories } = useContext(CategoriesContext);
    const { income, incomeLoading, getMonthIncome } = useIncome(session.user.username, monthInfo.year);
    const { historyLoading, putHistory, getMonthHistory } = useHistory(session.user.username);
    const monthIncome = getMonthIncome(monthInfo);

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
    // useEffect(() => {
    //     if (!incomeLoading && !categoriesLoading) {

    //         // Updates the categories by sending a PUT request to the API
    //         const updatedCategories = updateGuiltFreeSpending(monthIncome, categories);
    //         putCategories(updatedCategories);
    //     }
            
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [categories, monthIncome]);

    // Sets the table's total budget and actual spent values
    const footerValues = useMemo(() => {
        let totalActual = 0;
        categories.forEach(category => {
            totalActual += parseFloat(category.actual);
        });

        return {budget: monthIncome, actual: totalActual};
    }, [categories, monthIncome]);

    const handleEdit = () => {
        setEditClicked(true);
    };

    const displayFixedExpenses = () => {
        setShowFixedExpenses(!showFixedExpenses);
    };

    const displayVariableExpenses = () => {
        setShowVariableExpenses(!showVariableExpenses);
    };

    return (
        <Table striped>
            <thead className="table-dark">
                <tr className="d-flex">
                    <th className="col-6">
                        <Row className="d-flex">
                            <Col className="col-8 col-sm-9 col-lg-10 col-xl-9">
                                Category
                                <PopUp title="You can edit and add categories and their subcategories. You can also edit their budget and color." id="categories-info">
                                    <span> &#9432;</span>
                                </PopUp>
                            </Col>
                            <Col className="col-4 col-sm-3 col-lg-2 col-xl-3">
                                <Button className="btn-sm" id="edit-categories-btn" variant="secondary" onClick={handleEdit}>Edit</Button>
                            </Col>
                        </Row>
                    </th>
                    <th className="d-none d-md-block col-md-2">Budget</th>
                    <th className="col-3 col-md-2">Spent</th>
                    <th className="col-3 col-md-2 cell">Remaining</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th className="bg-secondary text-white clicker" colSpan={1} onClick={displayFixedExpenses}>
                        <Row className="d-flex">
                            <Col className="col-10">
                                Fixed Expenses
                                <PopUp title="Your expenses that remain the same each month." id="fixed-expenses-info">
                                    <span> &#9432;</span>
                                </PopUp>
                            </Col>
                            <Col className="col-2 text-end"><i className={`fw-bold bi ${showFixedExpenses ? "bi-chevron-up" : "bi-chevron-down"}`} /></Col>
                        </Row>
                    </th>
                </tr>
                {showFixedExpenses &&
                    categories.map(category => (
                        (category.fixed && <FixedCategoryRow key={category.id} category={category} />)
                    ))
                }
                <tr>
                    <th className="bg-secondary text-white clicker" colSpan={1} onClick={displayVariableExpenses}>
                        <Row className="d-flex">
                            <Col className="col-10">
                                Changing Expenses
                                <PopUp title="Your expenses that change depending on your spending." id="variable-expenses-info">
                                    <span> &#9432;</span>
                                </PopUp>
                            </Col>
                            <Col className="col-2 text-end"><i className={`fw-bold bi ${showVariableExpenses ? "bi-chevron-up" : "bi-chevron-down"}`} ></i></Col>
                        </Row>
                    </th>
                </tr>
                {showVariableExpenses &&
                    categories.map(category => (
                        (!category.fixed && <CategoryRow key={category.id} category={category} />)
                    ))
                }
            </tbody>
            <tfoot className="table-dark">
                <CategoryFooter footerValues={footerValues}/>
            </tfoot>
        </Table>
    );
};

export default CategoryTable;