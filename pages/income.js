import IncomeLayout from "@/components/income/incomeLayout";
import Loading from "@/components/layout/loading";
import dateInfo from "@/helpers/dateInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Income() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const year = dateInfo.currentYear;

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading')
        return <Loading />;
    else if (!session || status === 'unauthenticated')
        router.push('/redirect');
    else if (!session.user.onboarded)
        router.push('/onboarding');
    else
        return <IncomeLayout year={year} />;
};