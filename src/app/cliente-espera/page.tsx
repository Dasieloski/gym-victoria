"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, Sun, Moon, MessageSquare } from 'lucide-react'
import Cookies from 'js-cookie'
import { signOut, getSession } from 'next-auth/react'
import { addToHistorial } from '@/services/historialService';

export default function ClienteEsperaPage() {
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [clienteInfo, setClienteInfo] = useState(null)
    const [error, setError] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true'
        setIsDarkMode(isDark)
        document.documentElement.classList.toggle('dark', isDark)

        const fetchClienteInfo = async () => {
            try {
                const session = await getSession()
                if (!session || !session.user) {
                    throw new Error('No se encontró una sesión válida')
                }

                const response = await fetch(`/api/cliente-espera/${session.user.id}`)
                if (!response.ok) {
                    throw new Error('Error al obtener la información del cliente')
                }

                const data = await response.json()
                setClienteInfo(data)

                // Agregar al historial
             /*    await addToHistorial({
                    accion: 'Acceso a página de espera',
                    descripcion: 'Cliente en espera accedió a su página',
                    usuarioId: data.id,
                }); */
            } catch (error) {
                console.error('Error:', error as Error)
                setError(error as unknown as null) // Conversión a null
            }
        }

        fetchClienteInfo()
    }, [])

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode
        setIsDarkMode(newDarkMode)
        localStorage.setItem('darkMode', newDarkMode.toString())
        document.documentElement.classList.toggle('dark', newDarkMode)
    }

    const handleWhatsAppClick = async () => {
        const adminWhatsApp = '+5352833021'
        const message = encodeURIComponent('Hola, estoy interesad@ en unirme al Gym Victoria')
        window.open(`https://wa.me/${adminWhatsApp}?text=${message}`, '_blank')

        // Agregar al historial
      /*   try {
            await addToHistorial({
                accion: 'Contacto con administrador',
                descripcion: 'Cliente en espera contactó al administrador vía WhatsApp',
                usuarioId: (clienteInfo as any)?.id, // Utiliza el operador de encadenamiento opcional
            });
        } catch (error) {
            console.error('Error al agregar al historial:', error);
        } */
    }

    const handleSignOut = async () => {
        // Agregar al historial antes de cerrar sesión
      /*   try {
            await addToHistorial({
                accion: 'Cierre de sesión',
                descripcion: 'Cliente en espera cerró sesión',
                usuarioId: (clienteInfo as any)?.id,
            });
        } catch (error) {
            console.error('Error al agregar al historial:', error);
        } */

        Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName)
        })

        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
        }

        await signOut({ callbackUrl: '/' })
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-700 dark:text-gray-300">{error}</p>
                </div>
            </div>
        )
    }

    if (!clienteInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Cargando...</h1>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col`}>
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md transition-all duration-300">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <button
                        onClick={handleSignOut}
                        className="text-2xl font-bold text-[#2272FF] flex items-center transition-transform duration-300 hover:scale-105"
                    >
                        <Dumbbell className="mr-2" />
                        GYM-VICTORIA
                    </button>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-800 dark:text-gray-100 animate-fade-in-down">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2272FF] to-[#25D366]">
                            Bienvenido, {(clienteInfo as any).nombre}
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-400 animate-fade-in-up leading-relaxed">
                        Tu registro ha sido <span className="font-semibold text-[#2272FF] dark:text-[#25D366]">exitoso</span>.
                        Estás a un paso de comenzar tu viaje hacia una vida más saludable y activa.
                    </p>
                    <p className="text-lg mb-8 text-gray-500 dark:text-gray-400 animate-fade-in-up delay-200">
                        Para iniciar tu experiencia en GYM-VICTORIA, por favor contacta a nuestro administrador:
                    </p>
                    <button
                        onClick={handleWhatsAppClick}
                        className="px-8 py-4 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-all duration-300 flex items-center justify-center mx-auto text-lg font-semibold shadow-lg hover:shadow-xl animate-pulse hover:animate-none"
                    >
                        <MessageSquare size={24} className="mr-3" />
                        Contactar al Administrador
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 shadow-md transition-all duration-300 mt-auto">
                <div className="container mx-auto px-4 py-4 text-center text-gray-600 dark:text-gray-400">
                    © 2023 GYM-VICTORIA. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    )
}