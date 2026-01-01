import BudgetLayout from "@/components/budget/budgetLayout";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import getDateInfo from "@/helpers/getDateInfo";
import LoadingIndicator from "@/components/layout/loadingIndicator";

export default function Budget() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const today = new Date().toLocaleString("en-US");
  const dateInfo = getDateInfo(today);

  // Create a loading indicator while check on the status of a user's session
  if (status === "loading") {
    return <LoadingIndicator />;
  } else if (!session || status === "unauthenticated") {
    router.push("/redirect");
  } else {
    return (
      <>
        <Head>
          <title>Budget</title>
          <meta name="description" content="User's budget for the month" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <BudgetLayout dateInfo={dateInfo} />
      </>
    );
  }
}
