import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import OnboardingLayout from "@/components/onboarding/onboardingLayout";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Page() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading')
        return <Loading />;
    else if (session.user.onboarded)
        router.push('/');
    else {
        return (
            <>
                <Head>
                    <title>Onboarding</title>
                    <meta name="description" content="New user's onboarding" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <OnboardingLayout />     
            </>
        )
    }
};