import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
//import { authOptions } from "@/lib/auth";


declare module "next-auth" {
    interface User {
        rol: string;
        username: string;
        nombre: string;
        carnetIdentidad: string;
        telefono: string;
        id: string;
    }
    interface Session {
        user: User;
    }
}

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Record<"username" | "password", string> | undefined, req: any) {
                if (!credentials) return null;
                const { username, password } = credentials;

                const userFound = await prisma.usuario.findUnique({
                    where: {
                        username: credentials.username,
                    }
                })
                if (!userFound) {
                    throw new Error("El username no está registrado.");
                }
                const passwordMatch = await bcrypt.compare(credentials.password, userFound.password)
                if (!passwordMatch) {
                    throw new Error("La contraseña es incorrecta.");
                }
                return {
                    id: userFound.id.toString(),
                    username: userFound.username,
                    rol: userFound.rol,
                    nombre: userFound.nombre,
                    carnetIdentidad: userFound.carnetIdentidad,
                    telefono: userFound.telefono,
                };

            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.rol = user.rol;
                token.username = user.username;
                token.nombre = user.nombre;
                token.carnetIdentidad = user.carnetIdentidad;
                token.telefono = user.telefono;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.rol = token.rol as string;
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.nombre = token.nombre as string;
                session.user.carnetIdentidad = token.carnetIdentidad as string;
                session.user.telefono = token.telefono as string;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login/inicio',
        signOut: '/',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
