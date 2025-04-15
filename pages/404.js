import Layout404 from "@/components/errors/layout404";
import Head from "next/head";

export default function Page() {
    return (
        <>
            <Head>
                <title>404</title>
                <meta name="description" content="404 Error" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout404 />
        </>
    )
};