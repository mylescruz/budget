import HistoryBudget from "@/components/history/historyBudget";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useRouter } from "next/router";
import { Spinner } from "react-bootstrap";

export default function HistoryMonth() {
    const router = useRouter();

    const month = router.query.month;
    const year = parseInt(router.query.year);

    if (!month) {
        return (
            <>
                <h1 className="text-center">Loading user history</h1>
                <Spinner animation="border" variant="primary" className="mx-auto" />
            </>
        );
    }

    const monthInfo = getMonthInfo(month, year);

    return (
        <HistoryBudget monthInfo={monthInfo} />
    );
};