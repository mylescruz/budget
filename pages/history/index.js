import HistoryLayout from "@/components/history/historyLayout";
import { useSession } from "next-auth/react";
import { Spinner } from "react-bootstrap";

export default function History() {
    const { status } = useSession();

    if (status === 'loading') {
        return (
            <>
                <h1 className="text-center">Loading user history</h1>
                <Spinner animation="border" variant="primary" className="mx-auto" />
            </>
        )
    }

    return (
        <HistoryLayout/>
    );
};