import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/auth"; // Cambiar esta línea para importar authOptions

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

const handler = NextAuth(authOptions); // Asegúrate de que esta línea use authOptions importado

export { handler as GET, handler as POST };
