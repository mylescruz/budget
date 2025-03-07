import HistoryBudget from "@/components/history/historyBudget";
import Loading from "@/components/loading";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function HistoryMonth() {
    const { status } = useSession();
    const router = useRouter();

    const month = router.query.month;
    const year = parseInt(router.query.year);

    // Create a loading indicator while check on the status of a user's session
    if (!month || status === 'loading') {
        return <Loading />;
    } else {
        const monthInfo = getMonthInfo(month, year);
        
        return <HistoryBudget monthInfo={monthInfo} />;
    }
};