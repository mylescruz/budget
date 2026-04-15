import { Button, Card, Container } from "react-bootstrap";
import ErrorMessage from "../ui/errorMessage";

const CompleteSection = ({ finishOnboarding, onboardingError }) => {
  return (
    <Container className="col-12 col-lg-8">
      <Card className="card-background px-2 py-3">
        <Container className="text-center">
          <h5 className="mb-4">
            Thanks for setting up your new budget! Let&#39;s see it!
          </h5>

          {onboardingError && <ErrorMessage message={onboardingError} />}

          <Button
            variant="primary"
            onClick={finishOnboarding}
            disabled={onboardingError}
          >
            Get Started
          </Button>
        </Container>
      </Card>
    </Container>
  );
};

export default CompleteSection;
