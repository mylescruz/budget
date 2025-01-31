import BudgetLayout from "@/components/budget/budgetLayout";
import dateInfo from "@/helpers/dateInfo";

export default function Budget() {
    const month = dateInfo.currentMonth;
    const year = dateInfo.currentYear;

    return (
        <BudgetLayout month={month} year={year} />
    );
};