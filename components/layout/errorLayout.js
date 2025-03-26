import Link from "next/link";

const ErrorLayout = ({ message }) => {
    return (
        <div className="d-flex justify-content-center align-items-center error-layout">
            <h1>Uh oh... Something went wrong</h1>
            <p>{message}</p>
            <p>Please try again later.</p>
            <Link href="/" className="error-redirect">Go back to home page</Link>
        </div>
    )
};

export default ErrorLayout;