import LoadingIndicator from "@/components/layout/loadingIndicator";
import SummaryLayout from "@/components/summary/summaryLayout";
import getDateInfo from "@/helpers/getDateInfo";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Summary() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const year = parseInt(router.query.year);

  // Create a loading indicator while check on the status of a user's session
  if (status === "loading") {
    return <LoadingIndicator />;
  } else if (!session || status === "unauthenticated") {
    router.push("/redirect");
  } else {
    return (
      <>
        <Head>
          <title>Summary</title>
          <meta name="description" content="User's total summary" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <SummaryLayout summaryYear={year} />
      </>
    );
  }
}
