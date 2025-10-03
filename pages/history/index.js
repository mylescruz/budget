import HistoryLayout from "@/components/history/historyLayout";
import Loading from "@/components/layout/loading";
import getDateInfo from "@/helpers/getDateInfo";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function History() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const today = new Date();
  const dateInfo = getDateInfo(today);

  // Create a loading indicator while check on the status of a user's session
  if (status === "loading") {
    return <Loading />;
  } else if (!session || status === "unauthenticated") {
    router.push("/redirect");
  } else {
    return (
      <>
        <Head>
          <title>History</title>
          <meta name="description" content="User's budget history" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <HistoryLayout dateInfo={dateInfo} />
      </>
    );
  }
}
