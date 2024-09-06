"use client";

import { useState, useEffect } from 'react';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowLeft, LogIn, SquareUserRound } from 'lucide-react';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useSession } from "next-auth/react";
import prisma from '@/lib/prisma';

export default function LoginPage() {
    const { register, handleSubmit, setValue } = useForm(); // Integración de react-hook-form
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { data: session } = useSession();

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());
        document.documentElement.classList.toggle('dark', newDarkMode);
    };

    const onSubmit = async (data: any) => {
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                username: data.username,
                password: data.password,
            });

            if (result?.error) {
                // Manejo de errores...
                setError(result.error);
            } else if (result?.ok) {
                // Actualizar la sesión
                const updatedSession = await getSession();
                if (updatedSession?.user?.rol) {
                    switch (updatedSession.user.rol) {
                        case 'ENTRENADOR':
                            router.replace('/entrenador');
                            break;
                        case 'ADMIN':
                            router.replace('/admin');
                            break;
                        case 'CLIENTE':
                            router.replace(`/cliente/${updatedSession.user.id}`);
                            break;
                        case 'CLIENTEESPERA':
                            router.replace('/cliente-espera');
                            break;
                        default:
                            router.replace('/');
                    }
                }
            }
        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
            setError('Ocurrió un error inesperado. Por favor, intente de nuevo.');
        } finally {
            setIsLoading(false);
        }

        if (data.rememberMe) { // Verificar si se debe recordar al usuario
            localStorage.setItem('username', data.username); // Guardar el nombre de usuario
        } else {
            localStorage.removeItem('username'); // Eliminar el nombre de usuario si no se debe recordar
        }
    };

    useEffect(() => {
        const savedUsername = localStorage.getItem('username'); // Recuperar el nombre de usuario guardado
        if (savedUsername) {
            setValue("username", savedUsername); // Establecer el valor en el formulario
        }
    }, [setValue]); // Agregar setValue a las dependencias

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center px-4 transition-colors duration-300`}>
            <div className="w-full max-w-md">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="text-2xl font-bold text-[#2272FF] flex items-center transition-transform duration-300 hover:scale-105">
                        <Dumbbell className="mr-2" />
                        GYM-VICTORIA
                    </Link>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Iniciar Sesión</h2>
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                            <div className="relative">
                                <input
                                    id="username"
                                    {...register("username", { required: true })}
                                    type="text"
                                    className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2272FF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    placeholder="juan23"
                                />
                                <SquareUserRound className="absolute right-3 top-2.5 text-gray-400" size={20} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    {...register("password", { required: true })}
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2272FF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="rememberMe" // Asegúrate de que el nombre coincida con el que se usa en onSubmit
                                    type="checkbox"
                                    className="h-4 w-4 text-[#2272FF] focus:ring-[#2272FF] border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Recordarme
                                </label>
                            </div>
                        </div>
                        <div>
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#2272FF] text-white px-4 py-2 rounded-full hover:bg-[#1b5acc] transition-colors duration-300 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <span className="animate-spin mr-2">⏳</span>
                                ) : (
                                    <LogIn className="mr-2" size={20} />
                                )}
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ¿No tienes una cuenta?{' '}
                            <Link href="/login/registrarse" className="text-[#2272FF] hover:underline">
                                Regístrate
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#2272FF] transition-colors duration-300 flex items-center justify-center">
                        <ArrowLeft className="mr-2" size={16} />
                        Volver a la página principal
                    </Link>
                </div>
            </div>
        </div>
    )
}
