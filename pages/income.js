import IncomeLayout from "@/components/income/incomeLayout";
import Loading from "@/components/layout/loading";
import dateInfo from "@/helpers/dateInfo";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Income() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const year = dateInfo.currentYear;

  // Create a loading indicator while check on the status of a user's session
  if (status === "loading") {
    return <Loading />;
  } else if (!session || status === "unauthenticated") {
    router.push("/redirect");
  } else {
    return (
      <>
        <Head>
          <title>Income</title>
          <meta name="description" content="User's income" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <IncomeLayout year={year} />
      </>
    );
  }
}
