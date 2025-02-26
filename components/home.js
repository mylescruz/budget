import { signIn } from "next-auth/react";
import { Button, Card } from "react-bootstrap";

const Home = () => {
    const userSignIn = async () => {
        await signIn({ callbackUrl: '/'});
    };

    return (
        <>
            <Card className="w-50 mx-auto my-4 bg-secondary-subtle">
                <Card.Body>
                    <h2>The Type-A Budget</h2>
                    <p className="my-3 fs-5">A budget for people who want to track their finances down to the cent. <br /> Login to see where you&#39;re allocating your money!</p>
                    
                    <Button variant="dark" className="w-10 my-3" onClick={userSignIn}>Sign in</Button>
                </Card.Body>
            </Card>
        </>
    );
};

export default Home;