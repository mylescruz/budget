import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/user/authorize`, {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    });
                    const user = await res.json();
                
                    if (res.ok && user) {
                        return user;
                    } else {
                        return null;
                    }
                } catch (err) {
                    console.error("Error fetching user: ", err);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username;
            }
            return token;
        },
        async redirect({url, baseUrl}) {
            if (url.startsWith("/"))
                return `${baseUrl}${url}`;
            else
                return baseUrl;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.user.username = token.username;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);