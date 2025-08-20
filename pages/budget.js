import BudgetLayout from "@/components/budget/budgetLayout";
import Loading from "@/components/layout/loading";
import dateInfo from "@/helpers/dateInfo";
import getMonthInfo from "@/helpers/getMonthInfo";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Budget() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const month = dateInfo.currentMonth;
  const year = dateInfo.currentYear;
  const monthInfo = getMonthInfo(month, year);

  // Create a loading indicator while check on the status of a user's session
  if (status === "loading") {
    return <Loading />;
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
        <BudgetLayout monthInfo={monthInfo} />
      </>
    );
  }
}
