import HistoryBudgetLayout from "@/components/history/historyBudgetLayout";
import Loading from "@/components/layout/loading";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function HistoryMonth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const month = router.query.month;
  const year = parseInt(router.query.year);

  // Create a loading indicator while check on the status of a user's session
  if (!month || status === "loading") return <Loading />;
  else if (!session.user.onboarded) router.push("/onboarding");
  else {
    const monthInfo = getMonthInfo(month, year);

    return (
      <>
        <Head>
          <title>
            {month} {year} Budget
          </title>
          <meta
            name="description"
            content={`User's history for ${month} ${year}`}
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <HistoryBudgetLayout monthInfo={monthInfo} />
      </>
    );
  }
}
