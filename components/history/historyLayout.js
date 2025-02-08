import { Col, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";
import { useEffect } from "react";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";

const HistoryLayout = () => {
    const { history, historyLoading, postHistory, getMonthHistory } = useHistory();

    useEffect(() => {
        const addNewHistoryMonth = async () => {
            let maxID = 0;
            if (history.length > 0)
                maxID = Math.max(...history.map(month => month.id));
    
            const newMonth = {
                id: maxID + 1,
                month: dateInfo.currentMonth,
                year: dateInfo.currentYear,
                budget: 0,
                actual: 0,
                leftover: 0
            };
    
            postHistory(newMonth);
        };

        const monthInHistory = () => {
            const monthInfo = getMonthInfo(dateInfo.currentMonth, dateInfo.currentYear);
            const foundMonth = getMonthHistory(monthInfo);

            return foundMonth !== undefined;
        };

        if (!historyLoading && !monthInHistory())
            addNewHistoryMonth();

    },[history, historyLoading, postHistory, getMonthHistory]);

    return (
        <>
            <Row className="content-margin">
                <Col className="text-center"><h1>History</h1></Col>
            </Row>

            <HistoryTable history={history} />
        </>
    );
};

export default HistoryLayout;