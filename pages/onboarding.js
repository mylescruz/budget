import LoadingIndicator from "@/components/layout/loadingIndicator";
import OnboardingLayout from "@/components/onboarding/onboardingLayout";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <LoadingIndicator />;
  } else if (!session || status === "unauthenticated") {
    router.push("/redirect");
  } else if (session.user.onboarded) {
    router.push("/");
  } else {
    return (
      <>
        <Head>
          <title>Onboarding</title>
          <meta name="description" content="Onboard a new user" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <OnboardingLayout />
      </>
    );
  }
}
