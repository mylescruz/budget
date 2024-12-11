import { Button, Col, Row, Table } from "react-bootstrap";
import CategoryRow from "./categoryRow";
import CategoryFooter from "./categoryFooter";
import React, { useContext, useMemo } from "react";
import FixedCategoryRow from "./fixedCategoryRow";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import categorySorter from "@/helpers/categorySorter";
import usePaystubs from "@/hooks/usePaystubs";
import dateInfo from "@/helpers/dateInfo";

const CategoryTable = ({ setEditClicked }) => {
    const { categories } = useContext(CategoriesContext);
    const { paystubs } = usePaystubs(dateInfo.currentYear);
    const sortedCategories = categorySorter(categories);

    const footerValues = useMemo(() => {
        let totalActual = 0;
        let totalBudget = 0;
        categories.forEach(category => {
            totalActual += category.actual;
        });

        paystubs.forEach(paystub => {
            totalBudget += paystub.net
        });

        return {budget: totalBudget, actual: totalActual};
    }, [categories, paystubs]);
    // const footerValues = useMemo(() => {
    //     let totalIncome = 0;
    //     paystubs.map(paystub => {
    //         const paystubDate = new Date(paystub.date);
    //         const paystubMonth = paystubDate.toLocaleDateString('default', {month: 'long', timeZone: 'UTC'});
    //         if (paystubMonth === dateInfo.currentMonth)
    //             totalIncome += paystub.net;
    //     });

    //     let totalActual = 0;
    //     let totalBudget = 0;
    //     categories.forEach(category => {
    //         if (category.name !== "Guilt Free Spending")
    //             totalBudget += category.budget;

    //         totalActual += category.actual;
    //     });

    //     const guiltFreeSpending = categories.find(category => {
    //         return category.name === "Guilt Free Spending";
    //     });
    //     guiltFreeSpending.budget = totalIncome - totalBudget;

    //     return {budget: totalBudget, actual: totalActual};
    // }, [categories, paystubs]);

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
                    <th scope="col" className="col-2">Difference</th>
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

const CategoryTableMemo = React.memo(CategoryTable);

export default CategoryTable;
export { CategoryTableMemo };