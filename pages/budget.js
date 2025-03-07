import BudgetLayout from "@/components/budget/budgetLayout";
import Loading from "@/components/loading";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";

export default function Budget() {
    const { status } = useSession();
    
    const month = dateInfo.currentMonth;
    const year = dateInfo.currentYear;
    const monthInfo = getMonthInfo(month, year);
    
    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading') {
        return <Loading />;
    } else {
        return <BudgetLayout monthInfo={monthInfo} />;
    }
};