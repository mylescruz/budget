import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";

const CreateUser = () => {
    const emptyUser = {
        username: "",
        email: "",
        name: "",
        password: "",
        confirmPassword: ""
    };

    // Error validation object that checks if an object is valid and returns an error if not
    const validated = {
        valid: true,
        error: ''
    };

    const [newUser, setNewUser] = useState(emptyUser);
    const [validUsername, setValidUsername] = useState(validated);
    const [validEmail, setValidEmail] = useState(validated);
    const [validPassword, setValidPassword] = useState(validated);
    const [validMatch, setValidMatch] = useState(validated);
    const router = useRouter();

    const handleInput = (e) => {
        setNewUser({...newUser, [e.target.id]: e.target.value});
    };

    /* 
        Checks if the given username already exists
        Sends a GET request to the API and checks if there is a user returned
    */
    const checkUsername = async (username) => {
        const res = await fetch(`/api/user/${username}`);
        const user = await res.json();
        
        return user.exists;
    };

    // Checks if the given email is in valid email format
    const checkEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
        return regex.test(email);
    };

    // Checks if the given password matches the required format
    const checkPassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&*?])[a-zA-Z0-9!@#$%&*?]{8,}$/;
        return regex.test(password);
    };

    // Creates the new user by sending a POST request to the API
    const createUserS3 = async (newUser) => {
        try {
            await fetch(`/api/user/${newUser.username}`, {
                method: 'POST',
                headers: {
                    Accept: "application.json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            });
        } catch (err) {
            window.alert('Error creating user. Please try again');
            router.push('/createaccount');
        }
    };

    // Does all the validation checks to make sure the given input matches all the criteria
    const createNewUser = async (e) => {
        e.preventDefault();

        // Check if entered email is valid
        if (!checkEmail(newUser.email)) {
            setValidEmail({valid: false, error: 'Not a valid email address'});
            return;
        } else {
            setValidEmail(validated);
        }

        // Check if the username is already taken
        const userExists = await checkUsername(newUser.username);
        if (userExists) {
            setValidUsername({valid: false, error: 'Username is already taken'});
            return;
        } else {
            setValidUsername(validated);
        }

        // Check if entered password is valid
        if (!checkPassword(newUser.password)) {
            setValidPassword({valid: false, error: 'A password must have a minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'});
            return;
        } else {
            setValidPassword(validated);
        }

        // Check if entered password and password confirmation match
        if (newUser.password !== newUser.confirmPassword) {
            setValidMatch({valid: false, error: 'Passwords do not match'});
            return;
        } else {
            setValidMatch(validated);
        }

        // Add the user to S3
        await createUserS3(newUser);

        window.alert('User created successfully! Please login to your account.');

        // Redirects the user to the signIn page to login with the new credentials
        signIn();
    };

    return (
        <Container className="my-4 col-12 col-sm-8 col-md-6 col-lg-4 col-xl-4">
            <Card>
                <Card.Body>
                    <h4>Create account</h4>  
                    <Form onSubmit={createNewUser}>
                        <Form.Control type="text" id="name" className="h-100 my-2" value={newUser.name} placeholder="Name" onChange={handleInput} required />
                        <Form.Group controlId="email" className="h-100 my-2">
                            <Form.Control type="text" value={newUser.email} placeholder="Email" onChange={handleInput} isInvalid={validEmail.error && !validEmail.valid} required />
                            <Form.Control.Feedback type="invalid">{validEmail.error}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="username" className="h-100 my-2">
                            <Form.Control type="text" value={newUser.username} placeholder="Username" onChange={handleInput} required isInvalid={validUsername.error && !validUsername.valid} />
                            <Form.Control.Feedback type="invalid">{validUsername.error}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="password" className="h-100 my-2">
                            <Form.Control type="password" value={newUser.password} placeholder="Password" onChange={handleInput} required isInvalid={validPassword.error && !validPassword.valid} />
                            <Form.Control.Feedback type="invalid">{validPassword.error}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="confirmPassword" className="h-100 my-2">
                            <Form.Control type="password" value={newUser.confirmPassword} placeholder="Confirm Password" onChange={handleInput} required isInvalid={validMatch.error && !validMatch.valid} />
                            <Form.Control.Feedback type="invalid">{validMatch.error}</Form.Control.Feedback>
                            <Form.Text>
                                Your password must include: <br/>
                                <ul>
                                    <li>An uppercase letter</li>
                                    <li>A lowercase letter</li>
                                    <li>A number</li>
                                    <li>A special character: !@#$%&*?</li>
                                    <li>Minimum 8 characters</li>
                                </ul>
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="text-center">
                            <Button type="submit">Sign Up</Button>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateUser;