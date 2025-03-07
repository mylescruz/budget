import HistoryLayout from "@/components/history/historyLayout";
import Loading from "@/components/loading";
import { useSession } from "next-auth/react";

export default function History() {
    const { status } = useSession();

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading') {
        return <Loading />;
    } else {
        return <HistoryLayout />;
    }
};