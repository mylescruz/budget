import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        // For simplicity, using a credentials provider to allow a user to login with a username and password
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // Authorize a user's credentials in the server
                try {
                    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authorize/password`, {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    });
                    const user = await res.json();
                
                    if (res.ok && user) {
                        // If there is a proper response and user, return a user
                        return user;
                    } else {
                        // Otherwise, return null which would give a login error to the user
                        return null;
                    }
                } catch (err) {
                    console.error("Error fetching user: ", err);
                    return null;
                }
            }
        })
    ],
    session: {
        jwt: true,
        maxAge: 60 * 60 * 24
    },
    pages: {
        signIn: '/auth/signIn',
        createAccount: '/auth/createAccount'
    },
    callbacks: {
        // Update the token to include the user's username
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.onboarded = user.onboarded;
            }
            return token;
        },
        // Redirect a page to the given URL or to the base URL
        async redirect({url, baseUrl}) {
            if (url.startsWith("/"))
                return `${baseUrl}${url}`;
            else
                return baseUrl;
        },
        // Update the session to include the accessToken and username
        async session({ session, token }) {
            session.user.username = token.username;
            session.user.name = token.name;
            session.user.email = token.email;
            session.user.role = token.role;
            session.user.onboarded = token.onboarded;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);