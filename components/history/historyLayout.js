import { Col, Row } from "react-bootstrap";
import HistoryTable from "./historyTable";
import useHistory from "@/hooks/useHistory";
import { useEffect } from "react";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const HistoryLayout = () => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    // Using the router object to redirect to different pages within the app
    const router = useRouter();

    const { history, historyLoading, postHistory, getMonthHistory } = useHistory(session.user.username);

    // If there is no user session, redirect to the home page
    if (!session) {
        router.push('/');
    }

    // Adds the current month to the history array if not already added
    useEffect(() => {
        // Sets the new month object and sends the POST request to the API
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

        // Checks if the current dates' month and year is already history array
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
            <aside className="info-text text-center my-4 mx-auto">
                <h1>History</h1>
                <p>View your budget versus what you actually spent for previous months.</p>
            </aside>

            <HistoryTable history={history} />
        </>
    );
};

export default HistoryLayout;