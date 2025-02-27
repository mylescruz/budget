import BudgetLayout from "@/components/budget/budgetLayout";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import { Spinner } from "react-bootstrap";

export default function Budget() {
    const { status } = useSession();
    
    const month = dateInfo.currentMonth;
    const year = dateInfo.currentYear;
    const monthInfo = getMonthInfo(month, year);
    
    if (status === 'loading') {
        return <Spinner animation="border" variant="primary" className="mx-auto" />;
    } else {
        return <BudgetLayout monthInfo={monthInfo} />;
    }
};