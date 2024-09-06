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
                        username: credentials.username,
                    }
                })
                if (!userFound) {
                    throw new Error("El correo electrónico no está registrado.");
                }
                const passwordMatch = await bcrypt.compare(credentials.password, userFound.password)
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
        // Tus callbacks aquí
    },
    pages: {
        signIn: '/login/inicio',
        signOut: '/',
    },
};