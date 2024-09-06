"use client"
import { useState, useEffect } from 'react'
import { Dumbbell, Sun, Moon, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { signOut } from 'next-auth/react'

export default function NewClientPage() {
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true'
        setIsDarkMode(isDark)
        document.documentElement.classList.toggle('dark', isDark)
    }, [])

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode
        setIsDarkMode(newDarkMode)
        localStorage.setItem('darkMode', newDarkMode.toString())
        document.documentElement.classList.toggle('dark', newDarkMode)
    }

    const handleWhatsAppClick = () => {
        const adminWhatsApp = '+5352833021'
        const message = encodeURIComponent('Hola estoy interesad@ de unirme al Gym Victoria'); // Mensaje por defecto
        window.open(`https://wa.me/${adminWhatsApp}?text=${message}`, '_blank')
    }

    const handleSignOut = async () => {
        // Eliminar todas las cookies
        Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName);
        });

        // Eliminar tokens del localStorage si los hay
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }

        // Cerrar sesión usando next-auth
        await signOut({ callbackUrl: '/' });
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col`}>
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md transition-all duration-300">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <button
                        onClick={handleSignOut} // Llama a la función de cierre de sesión
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
                            Bienvenido a GYM-VICTORIA
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