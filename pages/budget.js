import BudgetLayout from "@/components/budget/budgetLayout";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { Spinner } from "react-bootstrap";

export default function Budget() {
    const month = dateInfo.currentMonth;
    const year = dateInfo.currentYear;
    const monthInfo = getMonthInfo(month, year);

    if (!month) {
        return (
            <>
                <h1 className="text-center">Loading budget</h1>
                <Spinner animation="border" variant="primary" className="mx-auto" />
            </>
        );
    }

    return (
        <BudgetLayout monthInfo={monthInfo} />
    );
};