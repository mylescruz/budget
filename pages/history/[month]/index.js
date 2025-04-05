import HistoryBudget from "@/components/history/historyBudget";
import Loading from "@/components/layout/loading";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function HistoryMonth() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const month = router.query.month;
    const year = parseInt(router.query.year);

    // Create a loading indicator while check on the status of a user's session
    if (!month || status === 'loading')
        return <Loading />;
    else if (!session.user.onboarded)
            router.push('/onboarding');
    else {
        const monthInfo = getMonthInfo(month, year);
        
        return <HistoryBudget monthInfo={monthInfo} />;
    }
};