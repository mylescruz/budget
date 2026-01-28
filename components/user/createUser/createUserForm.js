import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";

const inputValidation = {
  username: { valid: true, error: "" },
  email: { valid: true, error: "" },
  password: { valid: true, error: "" },
  passwordMatch: { valid: true, error: "" },
};

const CreateUserForm = ({ newUser, setNewUser, setModal, createUser }) => {
  const [validInput, setValidInput] = useState(inputValidation);

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

  const verifyInput = async (e) => {
    e.preventDefault();

    setModal("loading");

    let validUser = true;
    const errors = { ...inputValidation };

    // Check if entered email is valid
    if (!checkEmail(newUser.email)) {
      errors.email = { valid: false, error: "Not a valid email address" };

      validUser = false;
    }

    // Check if the username is a valid length
    const validLength = checkUsernameLength(newUser.username);
    if (!validLength) {
      errors.username = {
        valid: false,
        error: "A username must have a minimum four alphanumeric characters",
      };

      validUser = false;
    }

    // Check if the username is already taken
    const userExists = await checkUsername(newUser.username);
    if (userExists) {
      errors.username = { valid: false, error: "Username is already taken" };

      validUser = false;
    }

    // Check if entered password is valid
    if (!checkPassword(newUser.password)) {
      errors.password = {
        valid: false,
        error: "This password doesn't fit the requirements",
      };

      validUser = false;
    }

    // Check if entered password and password confirmation match
    if (newUser.password !== newUser.confirmPassword) {
      errors.passwordMatch = { valid: false, error: "Passwords do not match" };

      validUser = false;
    }

    if (!validUser) {
      setModal("none");

      setValidInput(errors);

      return;
    }

    await createUser();
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card className="p-3 col-12 col-sm-10 col-md-6 col-lg-4 card-background">
        <h1 className="text-center">Create account</h1>
        <Form onSubmit={verifyInput}>
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
              isInvalid={!validInput.email.valid}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validInput.email.error}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="username" className="h-100 my-2">
            <Form.Control
              type="text"
              value={newUser.username}
              placeholder="Username"
              onChange={handleInput}
              isInvalid={!validInput.username.valid}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validInput.username.error}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="password" className="h-100 my-2">
            <Form.Control
              type="password"
              value={newUser.password}
              placeholder="Password"
              onChange={handleInput}
              isInvalid={!validInput.password.valid}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validInput.password.error}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="confirmPassword" className="h-100 my-2">
            <Form.Control
              type="password"
              value={newUser.confirmPassword}
              placeholder="Confirm Password"
              onChange={handleInput}
              isInvalid={!validInput.passwordMatch.valid}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validInput.passwordMatch.error}
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
