import Loading from "@/components/layout/loading";
import CreateUserLayout from "@/components/user/createUser/createUserLayout";
import { getCsrfToken, useSession } from "next-auth/react";

export default function Create({ csrfToken }) {
  const { status } = useSession();

  if (status === "loading") {
    return <Loading />;
  } else {
    return <CreateUserLayout csrfToken={csrfToken} />;
  }
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
