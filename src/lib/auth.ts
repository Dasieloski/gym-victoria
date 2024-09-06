import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Record<"username" | "password", string> | undefined, req: any) { // Cambiar la firma de la función
                if (!credentials) return null; // Asegúrate de retornar null si no hay credenciales
                const { username, password } = credentials;

                const userFound = await prisma.usuario.findUnique({
                    where: {
                        username: username,
                    }
                });
                if (!userFound) {
                    throw new Error("El nombre de usuario no está registrado.");
                }
                const passwordMatch = await bcrypt.compare(password, userFound.password);
                if (!passwordMatch) {
                    throw new Error("La contraseña es incorrecta.");
                }
                return { // Asegúrate de retornar un objeto de usuario
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
                // Agrega otros campos que necesites
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string; // Asegúrate de que token.id sea un string
                session.user.rol = token.rol as string; // Asegúrate de que token.rol sea un string
                // Agrega otros campos que necesites
            }
            return session;
        }
    },
    pages: {
        signIn: '/login/inicio',
        signOut: '/',
    },
};