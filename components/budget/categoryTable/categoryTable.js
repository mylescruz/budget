import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";
import CategoryFooter from "./categoryFooter";
import React, { useContext, useEffect, useMemo, useState } from "react";
import FixedCategoryRow from "./fixedCategoryRow";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import categorySorter from "@/helpers/categorySorter";
import usePaystubs from "@/hooks/usePaystubs";
import useHistory from "@/hooks/useHistory";
import updateGuiltFreeSpending from "@/helpers/updateGuiltFreeSpending";
import { useSession } from "next-auth/react";

const CategoryTable = ({ setEditClicked, monthInfo }) => {
    const { data: session } = useSession();

    const { categories, categoriesLoading, putCategories } = useContext(CategoriesContext);
    const { paystubs, paystubsLoading, getMonthIncome } = usePaystubs(session.user.username, monthInfo.year);
    const sortedCategories = categorySorter(categories);
    const { historyLoading, putHistory, getMonthHistory } = useHistory(session.user.username);

    useEffect(() => {
        const updateHistoryValues = async () => {
            let totalActual = 0;
            categories.forEach(category => {
                totalActual += category.actual;
            });

            const foundMonth = getMonthHistory(monthInfo);

            if (foundMonth) {
                foundMonth.actual = totalActual;
                foundMonth.leftover = (foundMonth.budget - totalActual).toFixed(2);

                putHistory(foundMonth);
            }
        };

        if (!categoriesLoading && !historyLoading) {
            updateHistoryValues();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]);

    useEffect(() => {
        // Update the Guilt Free Spending Category when paystubs changes
        if (!paystubsLoading && !categoriesLoading) {
            const income = getMonthIncome(monthInfo);

            const updatedCategories = updateGuiltFreeSpending(income, categories);
            putCategories(updatedCategories);
        }
            
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paystubs]);

    const footerValues = useMemo(() => {
        let totalActual = 0;
        categories.forEach(category => {
            totalActual += category.actual;
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
                            <Col xs={9} sm={9} md={9}>Category</Col>
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
                    <th className="bg-secondary text-white" colSpan={1}>Fixed Expenses</th>
                </tr>
                {sortedCategories.map(category => (
                    (category.fixed && <FixedCategoryRow key={category.id} category={category} />)
                ))}
                <tr>
                    <th className="bg-secondary text-white" colSpan={1}>Variable Expenses</th>
                </tr>
                {sortedCategories.map(category => (
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