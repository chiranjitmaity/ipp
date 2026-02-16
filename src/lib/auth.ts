import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// const adapter = process.env.MONGODB_URI ? MongoDBAdapter(clientPromise) : undefined;

export const authOptions: NextAuthOptions = {
    // adapter: adapter as any, // Temporarily disabled to debug server error
    debug: true, // Enable debug logs
    secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev',
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
        }),
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                username: { label: "Email", type: "email", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const email = credentials?.username;
                const password = credentials?.password;

                // 1. Check Hardcoded Admin
                if (email === "chiranjitmaity602@gmail.com" && password === "24582854cM@@") {
                    return {
                        id: "admin-chiranjit",
                        name: "Admin User",
                        email: "chiranjitmaity602@gmail.com",
                        role: "admin",
                        image: ""
                    };
                }

                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/admin/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
