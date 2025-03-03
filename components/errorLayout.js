import Link from "next/link";

const ErrorLayout = ({ status }) => {
    return (
        <div className="d-flex justify-content-center align-items-center error-layout">
            <h1>Uh oh... {status} Error</h1>
            <p>Please try again later.</p>
            <Link href="/" className="error-redirect">Go back to home page</Link>
        </div>
    )
};

export default ErrorLayout;