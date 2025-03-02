import HistoryLayout from "@/components/history/historyLayout";
import { useSession } from "next-auth/react";
import { Spinner } from "react-bootstrap";

export default function History() {
    const { status } = useSession();

    if (status === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center loading-spinner">
                <Spinner animation="border" variant="primary"/>
            </div>
        );
    } else {
        return <HistoryLayout/>;
    }
};