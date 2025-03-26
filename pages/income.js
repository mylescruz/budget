import IncomeLayout from "@/components/income/incomeLayout";
import Loading from "@/components/layout/loading";
import dateInfo from "@/helpers/dateInfo";
import { useSession } from "next-auth/react";

export default function Income() {
    const { status } = useSession();

    const year = dateInfo.currentYear;

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading') {
        return <Loading />;
    } else {
        return <IncomeLayout year={year} />;
    }
};