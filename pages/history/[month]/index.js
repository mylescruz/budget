import HistoryBudget from "@/components/history/historyBudget";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useRouter } from "next/router";

export default function HistoryMonth() {
    const router = useRouter();
    const monthInfo = getMonthInfo(router.query.month, router.query.year);

    return (
        <HistoryBudget monthInfo={monthInfo} />
    );
};