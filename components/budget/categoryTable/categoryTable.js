import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";
import CategoryFooter from "./categoryFooter";
import React, { useContext, useEffect, useMemo } from "react";
import FixedCategoryRow from "./fixedCategoryRow";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import categorySorter from "@/helpers/categorySorter";
import usePaystubs from "@/hooks/usePaystubs";
import useHistory from "@/hooks/useHistory";

const CategoryTable = ({ setEditClicked, monthInfo }) => {
    const { categories, categoriesLoading } = useContext(CategoriesContext);
    const { getMonthIncome } = usePaystubs(monthInfo.year);
    const sortedCategories = categorySorter(categories);
    const { history, historyLoading, putHistory } = useHistory();

    useEffect(() => {
        const updateHistoryValues = async () => {
            let totalActual = 0;
            categories.forEach(category => {
                totalActual += category.actual;
            });

            const foundMonth = history.find(currentMonth => {
                return currentMonth.month === monthInfo.month && currentMonth.year === monthInfo.year;
            });

            if (foundMonth) {
                foundMonth.actual = totalActual;
                foundMonth.leftover = foundMonth.budget - totalActual;

                putHistory(foundMonth);
            }
        };

        if (!categoriesLoading && !historyLoading) {
            updateHistoryValues();
        }
    }, [categories]);

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
                <tr>
                    <th scope="col">
                        <Row className="alignX">
                            <Col className="col-8">Category</Col>
                            <Col className="col-4"><Button className="btn-sm" id="edit-categories-btn" variant="secondary" onClick={handleEdit}>Edit</Button></Col>
                        </Row>
                    </th>
                    <th scope="col" className="col-2">Budget</th>
                    <th scope="col" className="col-2">Actual</th>
                    <th scope="col" className="col-2">Leftover</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th className="bg-secondary text-white" colSpan={4}>Fixed Expenses</th>
                </tr>
                {sortedCategories.map(category => (
                    (category.fixed && <FixedCategoryRow key={category.id} category={category} />)
                ))}
                <tr>
                    <th className="bg-secondary text-white" colSpan={4}>Variable Expenses</th>
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