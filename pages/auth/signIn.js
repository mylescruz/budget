import LoginPage from "@/components/user/loginPage";
import { getCsrfToken } from "next-auth/react";

export default function Page({ csrfToken }) {
    return <LoginPage csrfToken={csrfToken} />;
};

export async function getServerSideProps(context) {
    return {
        props: {
            csrfToken: await getCsrfToken(context)
        }
    }
}