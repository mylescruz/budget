import { Button, Card, Container } from "react-bootstrap";

const CompleteSection = ({ finishOnboarding }) => {
  return (
    <Container className="col-12 col-lg-8">
      <Card className="card-background px-2 py-3">
        <Container className="text-center">
          <h5 className="mt-2 mb-4">
            Thanks for setting up your new budget! Let&#39;s see it!
          </h5>

          <Button variant="primary" onClick={finishOnboarding}>
            Create Account!
          </Button>
        </Container>
      </Card>
    </Container>
  );
};

export default CompleteSection;
