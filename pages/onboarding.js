import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import OnboardingLayout from "@/components/onboarding/onboardingLayout";
import { useRouter } from "next/router";

export default function Page() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading')
        return <Loading />;
    else if (session.user.onboarded)
        router.push('/');
    else
        return <OnboardingLayout />;
};