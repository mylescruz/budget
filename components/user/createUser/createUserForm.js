import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";

const CreateUserForm = ({ newUser, setNewUser, finishAccountCreation }) => {
  const validated = {
    valid: true,
    error: "",
  };

  const [validUsername, setValidUsername] = useState(validated);
  const [validEmail, setValidEmail] = useState(validated);
  const [validPassword, setValidPassword] = useState(validated);
  const [validMatch, setValidMatch] = useState(validated);

  const handleInput = (e) => {
    setNewUser({ ...newUser, [e.target.id]: e.target.value });
  };

  const checkUsernameLength = (username) => {
    const regex = /^[a-zA-Z0-9]{4,}$/;
    return regex.test(username);
  };

  const checkUsername = async (username) => {
    const res = await fetch(`/api/authorize/${username}`);
    const user = await res.json();

    return user.exists;
  };

  const checkEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
    return regex.test(email);
  };

  const checkPassword = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&*?])[a-zA-Z0-9!@#$%&*?]{8,}$/;
    return regex.test(password);
  };

  const createUser = async (e) => {
    e.preventDefault();

    // Check if entered email is valid
    if (!checkEmail(newUser.email)) {
      setValidEmail({ valid: false, error: "Not a valid email address" });
      return;
    } else {
      setValidEmail(validated);
    }

    // Check if the username is a valid length
    const validLength = checkUsernameLength(newUser.username);
    if (!validLength) {
      setValidUsername({
        valid: false,
        error: "A username must have a minimum four alphanumeric characters",
      });
      return;
    } else {
      setValidUsername(validated);
    }

    // Check if the username is already taken
    const userExists = await checkUsername(newUser.username);
    if (userExists) {
      setValidUsername({ valid: false, error: "Username is already taken" });
      return;
    } else {
      setValidUsername(validated);
    }

    // Check if entered password is valid
    if (!checkPassword(newUser.password)) {
      setValidPassword({
        valid: false,
        error:
          "A password must have a minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
      });
      return;
    } else {
      setValidPassword(validated);
    }

    // Check if entered password and password confirmation match
    if (newUser.password !== newUser.confirmPassword) {
      setValidMatch({ valid: false, error: "Passwords do not match" });
      return;
    } else {
      setValidMatch(validated);
    }

    await finishAccountCreation();
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card className="p-3 col-12 col-sm-10 col-md-6 col-lg-4 card-background">
        <h1 className="text-center">Create account</h1>
        <Form onSubmit={createUser}>
          <Form.Group controlId="name" className="h-100 my-2">
            <Form.Control
              type="text"
              value={newUser.name}
              placeholder="Name"
              onChange={handleInput}
              required
            />
          </Form.Group>
          <Form.Group controlId="email" className="h-100 my-2">
            <Form.Control
              type="text"
              value={newUser.email}
              placeholder="Email"
              onChange={handleInput}
              isInvalid={validEmail.error && !validEmail.valid}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validEmail.error}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="username" className="h-100 my-2">
            <Form.Control
              type="text"
              value={newUser.username}
              placeholder="Username"
              onChange={handleInput}
              isInvalid={validUsername.error && !validUsername.valid}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validUsername.error}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="password" className="h-100 my-2">
            <Form.Control
              type="password"
              value={newUser.password}
              placeholder="Password"
              onChange={handleInput}
              isInvalid={validPassword.error && !validPassword.valid}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validPassword.error}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="confirmPassword" className="h-100 my-2">
            <Form.Control
              type="password"
              value={newUser.confirmPassword}
              placeholder="Confirm Password"
              onChange={handleInput}
              isInvalid={validMatch.error && !validMatch.valid}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validMatch.error}
            </Form.Control.Feedback>
            <Form.Text>
              Your password must include:
              <ul>
                <li>An uppercase letter</li>
                <li>A lowercase letter</li>
                <li>A number</li>
                <li>A special character: !@#$%&*?</li>
                <li>Minimum 8 characters</li>
              </ul>
            </Form.Text>
          </Form.Group>
          <Button className="w-100" type="submit">
            Sign Up
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default CreateUserForm;
