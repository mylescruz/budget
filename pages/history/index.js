import HistoryLayout from "@/components/history/historyLayout";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function History() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading')
        return <Loading />;
    else if (!session.user.onboarded)
        router.push('/onboarding');
    else {
        return (
            <>
                <Head>
                    <title>History</title>
                    <meta name="description" content="User's budget history" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <HistoryLayout />
            </>
        )
    }
};