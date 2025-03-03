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
    
    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center loading-spinner">
                <Spinner animation="border" variant="primary"/>
            </div>
        );
    } else {
        return <BudgetLayout monthInfo={monthInfo} />;
    }
};