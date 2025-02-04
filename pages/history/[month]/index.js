import BudgetLayout from "@/components/budget/budgetLayout";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useRouter } from "next/router";

export default function MonthHistory() {
    const router = useRouter();
    const monthInfo = getMonthInfo(router.query.month, router.query.year);

    return (
        <BudgetLayout monthInfo={monthInfo}/>
    );
};