import HistoryBudgetLayout from "@/components/history/historyBudgetLayout";
import LoadingIndicator from "@/components/layout/loadingIndicator";
import getDateInfo from "@/helpers/getDateInfo";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function HistoryMonth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const month = parseInt(router.query.month);
  const year = parseInt(router.query.year);

  // Create a loading indicator while check on the status of a user's session
  if (!month || status === "loading") {
    return <LoadingIndicator />;
  } else if (!session || status === "unauthenticated") {
    router.push("/redirect");
  } else {
    const date = new Date(`${month}/01/${year}`);
    const dateInfo = getDateInfo(date);

    return (
      <>
        <Head>
          <title>
            {dateInfo.monthName} {dateInfo.year} Budget
          </title>
          <meta
            name="description"
            content={`User's history for ${dateInfo.monthName} ${dateInfo.year}`}
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <HistoryBudgetLayout dateInfo={dateInfo} />
      </>
    );
  }
}
