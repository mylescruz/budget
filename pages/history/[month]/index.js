import HistoryBudget from "@/components/history/historyBudget";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Spinner } from "react-bootstrap";

export default function HistoryMonth() {
    const { status } = useSession();
    const router = useRouter();

    const month = router.query.month;
    const year = parseInt(router.query.year);

    // Create a loading indicator while check on the status of a user's session
    if (!month || status === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center loading-spinner">
                <Spinner animation="border" variant="primary"/>
            </div>
        );
    } else {
        const monthInfo = getMonthInfo(month, year);
        
        return <HistoryBudget monthInfo={monthInfo} />;
    }
};