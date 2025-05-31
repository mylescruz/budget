import Loading from "@/components/layout/loading";
import CreateUserForm from "@/components/user/createUserForm";
import { getCsrfToken, useSession } from "next-auth/react";

export default function Create({ csrfToken }) {
  const { status } = useSession();

  if (status === "loading") return <Loading />;
  else return <CreateUserForm csrfToken={csrfToken} />;
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
