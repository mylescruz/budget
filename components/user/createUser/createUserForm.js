import handleObjectInput from "@/helpers/handleObjectInput";
import Link from "next/link";
import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";

const errorFields = {
  message: null,
  username: null,
  email: null,
  password: null,
  passwordMatch: null,
};

const CreateUserForm = ({
  newUser,
  setNewUser,
  formErrors,
  setFormErrors,
  setModal,
  createUser,
}) => {
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

    let validInput = true;
    const errors = { ...errorFields };

    // Check if entered email is valid
    if (!checkEmail(newUser.email)) {
      errors.email = "Not a valid email address";

      validInput = false;
    }

    // Check if the username is a valid length
    const validLength = checkUsernameLength(newUser.username);
    if (!validLength) {
      errors.username =
        "A username must have a minimum four alphanumeric characters";

      validInput = false;
    }

    // Check if the username is already taken
    const userExists = await checkUsername(newUser.username);
    if (userExists) {
      errors.username = `${newUser.username} is already taken`;

      validInput = false;
    }

    // Check if entered password is valid
    if (!checkPassword(newUser.password)) {
      errors.password = "This password doesn't fit the requirements";

      validInput = false;
    }

    // Check if entered password and password confirmation match
    if (newUser.password !== newUser.confirmPassword) {
      errors.passwordMatch = "Passwords do not match";

      validInput = false;
    }

    if (!validInput) {
      setModal("none");

      setFormErrors({
        ...errors,
        message:
          "Some of the information you entered needs to be fixed. Please update it to continue.",
      });

      return;
    } else {
      setFormErrors({ ...errorFields });
    }

    try {
      await createUser();
    } catch (error) {
      throw error;
    }
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
              onChange={(e) => handleObjectInput({ e, setObject: setNewUser })}
              required
            />
          </Form.Group>
          <Form.Group controlId="email" className="h-100 my-2">
            <Form.Control
              type="text"
              value={newUser.email}
              placeholder="Email"
              onChange={(e) => handleObjectInput({ e, setObject: setNewUser })}
              isInvalid={formErrors.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="username" className="h-100 my-2">
            <Form.Control
              type="text"
              value={newUser.username}
              placeholder="Username"
              onChange={(e) => handleObjectInput({ e, setObject: setNewUser })}
              isInvalid={formErrors.username}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.username}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="password" className="h-100 my-2">
            <Form.Control
              type="password"
              value={newUser.password}
              placeholder="Password"
              onChange={(e) => handleObjectInput({ e, setObject: setNewUser })}
              isInvalid={formErrors.password}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.password}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="confirmPassword" className="h-100 my-2">
            <Form.Control
              type="password"
              value={newUser.confirmPassword}
              placeholder="Confirm Password"
              onChange={(e) => handleObjectInput({ e, setObject: setNewUser })}
              isInvalid={formErrors.passwordMatch}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.passwordMatch}
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
          {formErrors.message && (
            <p className="text-center text-danger small">
              {formErrors.message}
            </p>
          )}
          <Button className="w-100" type="submit">
            Sign Up
          </Button>
        </Form>
        <Link href="/auth/signIn" className="mt-2 text-center small">
          Already have an account?{" "}
          <span className="text-primary text-decoration-underline">Login</span>
        </Link>
      </Card>
    </Container>
  );
};

export default CreateUserForm;
