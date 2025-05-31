import LoginPageForm from "@/components/user/loginPageForm";
import { getCsrfToken } from "next-auth/react";

export default function Page({ csrfToken }) {
  return <LoginPageForm csrfToken={csrfToken} />;
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
