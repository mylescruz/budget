import { Button, Container } from "react-bootstrap";

const OnboardingComplete = ({ setBudget }) => {
    return (
        <>
            <Container className="text-center">
                <h5 className="mt-2 mb-4">Thanks for setting up your new budget! Let&#39;s see it!</h5>

                <Button variant="primary" onClick={setBudget}>Let&#39;s Go!</Button>
            </Container>
        </>
    );
};

export default OnboardingComplete;