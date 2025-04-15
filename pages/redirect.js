import RedirectLayout from "@/components/layout/redirectLayout";
import Head from "next/head";

export default function Redirect() {
    return (
        <>
            <Head>
                <title>Redirect</title>
                <meta name="description" content="Redirect user back to home page" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <RedirectLayout/>
        </>
    )
};