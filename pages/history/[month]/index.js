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
            <div className="d-flex justify-content-center align-items-center loading-spinner">
                <Spinner animation="border" variant="primary"/>
            </div>
        );
    } else {
        const monthInfo = getMonthInfo(month, year);
        
        return <HistoryBudget monthInfo={monthInfo} />;
    }
};