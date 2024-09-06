"use client";

import { useState, useEffect } from 'react';
import { Dumbbell, User, Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowLeft, Phone, SquareUserRound, UserRoundCheck } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();
    const onSubmit = handleSubmit(async (data) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                router.push('/login/inicio');
            }
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error en el registro");
            }
            const resJSON = await res.json();
            console.log(resJSON);
            // Manejar el éxito aquí
        } catch (error) {
            console.error("Error al registrar:", error);
            // Mostrar el error al usuario
        }
    });

    const validateNombre = (value: string) => {
        const regex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+( [A-Za-záéíóúÁÉÍÓÚñÑ]+){2,}$/;
        return regex.test(value) || "El nombre debe contener un nombre y dos apellidos sin números.";
    };

    const validateCarnetIdentidad = (value: string) => {
        return /^\d{11}$/.test(value) || "El carnet de identidad debe ser un número de 11 dígitos.";
    };

    const validateTelefono = (value: string) => {
        return /^\+53\d{8}$/.test(value) || "El teléfono debe comenzar con +53 y tener 11 dígitos en total.";
    };

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
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Registrarse</h2>
                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo</label>
                            <div className="relative">
                                <input
                                    id="nombre"
                                    {...register("nombre", { required: true, validate: validateNombre })}
                                    type="text"
                                    className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2272FF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    placeholder="Juan Pérez"
                                />
                                <User className="absolute right-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message as string}</p>} {/* Mensaje de error */}
                        </div>
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
                            <label htmlFor="carnetIdentidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carnet de identidad</label>
                            <div className="relative">
                                <input
                                    id="carnetIdentidad"
                                    {...register("carnetIdentidad", { required: true, validate: validateCarnetIdentidad })}
                                    type="number"
                                    className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2272FF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    placeholder="98765432100"
                                />
                                <UserRoundCheck className="absolute right-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            {errors.carnetIdentidad && <p className="text-red-500 text-sm">{errors.carnetIdentidad.message as string}</p>} {/* Mensaje de error */}
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                            <div className="relative">
                                <input
                                    id="telefono"
                                    {...register("telefono", { required: true, validate: validateTelefono })}
                                    type="tel"
                                    className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2272FF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    placeholder="+53 54321000"
                                />
                                <Phone className="absolute right-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message as string}</p>} {/* Mensaje de error */}
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
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-[#2272FF] text-white px-4 py-2 rounded-full hover:bg-[#1b5acc] transition-colors duration-300 flex items-center justify-center"
                            >
                                <User className="mr-2" size={20} />
                                Registrarse
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login/inicio" className="text-[#2272FF] hover:underline">
                                Inicia sesión
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
    );
}
