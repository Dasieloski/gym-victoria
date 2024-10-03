import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
    try {
        const data = await request.json()
        console.log("Datos recibidos:", data) // Log detallado de los datos recibidos

        // Validar campos requeridos
        if (!data.nombre || !data.username || !data.carnetIdentidad || !data.telefono || !data.password || !data.foto) {
            console.log("Faltan campos requeridos")
            return NextResponse.json({
                message: "Todos los campos son obligatorios"
            }, { status: 400 })
        }

        const userfound = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { username: data.username },
                    { carnetIdentidad: data.carnetIdentidad }
                ]
            }
        })

        if (userfound) {
            return NextResponse.json({
                message: "El usuario ya existe"
            }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)
        const NewUser = await prisma.usuario.create({
            data: {
                foto: data.foto, // Guardar la URL de la imagen de perfil
                nombre: data.nombre,
                username: data.username,
                carnetIdentidad: data.carnetIdentidad,
                telefono: data.telefono,
                password: hashedPassword,
                rol: 'CLIENTEESPERA',
            }
        })

        console.log("Usuario creado exitosamente:", NewUser)
        return NextResponse.json({ message: "Usuario creado exitosamente", user: NewUser })
    } catch (error) {
        console.error("Error en el registro:", error)
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
    }
}