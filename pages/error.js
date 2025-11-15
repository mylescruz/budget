import ErrorLayout from "@/components/errors/errorLayout";
import LoadingIndicator from "@/components/layout/loadingIndicator";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  const message = router?.query.message;

  // Create a loading indicator while check on the status of a user's session
  if (status === "loading") {
    return <LoadingIndicator />;
  } else {
    return (
      <>
        <Head>
          <title>Error</title>
          <meta name="description" content="An error occurred" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ErrorLayout message={message} />
      </>
    );
  }
}
