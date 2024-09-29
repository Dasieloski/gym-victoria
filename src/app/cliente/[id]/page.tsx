"use client";

import { useState, useEffect } from 'react';
import { Dumbbell, Sun, Moon, ChevronRight, ChevronLeft, X, Menu, MessageSquare, Activity, User, CreditCard, Phone, Calendar, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { signOut } from "next-auth/react";
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ClientInfo {
    id: number;
    foto: string;
    nombre: string;
    carnetIdentidad: string;
    telefono: string;
    rol: string;
    entrenadorId: number | null;
    entrenadorAsignado?: {
        id: number;
        nombre: string;
        telefono: string; // Nuevo campo para el número de teléfono del entrenador
    } | null; // Información del entrenador asignado
    membresia: {
        id: number;
        tipo: string;
        fechaInicio: string;
        fechaFin: string;
        estadoPago: string;
    } | null;
    membresias: {
        id: number;
        tipo: string;
        fechaInicio: string;
        fechaFin: string;
        estadoPago: string;
    }[];
    visitasEsteMes: number; // Nuevo campo para el conteo de visitas
    entrenador: {
        id: number;
        nombre: string;
    } | null; // Nuevo campo para el nombre del entrenador
    profileImage?: string; // Nuevo campo para la imagen de perfil
}

interface Booking {
    id: number;
    fecha: string;
    estado: string;
    cliente: {
        id: number;
        nombre: string;
    };
    entrenadorNombre?: string; // Opcional, según tus necesidades
}
interface PageParams {
    id: string;
}

interface Reserva {
    id: number;
    fecha: string;
    estado: string;
    entrenador?: {
        id: number;
        nombre: string;
    };
}

export default function ClientPage({ params }: { params: PageParams }) {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [activeTab, setActiveTab] = useState('personal')
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [visitsThisMonth, setVisitsThisMonth] = useState(0)
    const [motivationalQuote, setMotivationalQuote] = useState('')
    const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
    const [animatingId, setAnimatingId] = useState<number | null>(null);
    const [newBookingId, setNewBookingId] = useState<number | null>(null); // Para la nueva reserva

    const motivationalQuotes = [
        "El único mal entrenamiento es el que no hiciste.💪",
        "No dejes que tus excusas sean más fuertes que tus sueños💪.",
        "El dolor que sientes hoy será tu fuerza mañana.💥",
        "Tu cuerpo puede soportar casi cualquier cosa. Es tu mente la que debes convencer.🧠",
        "Sé más fuerte que tus excusas.💪",
        "El éxito comienza cuando sales de tu zona de confort.🚀",
        "No te detengas cuando estés cansado. Detente cuando hayas terminado.🏁",
        "La disciplina es elegir entre lo que quieres ahora y lo que quieres más.⚖️",
        "Entrena como si nunca hubieras ganado. Actúa como si nunca hubieras perdido.🏋️",
        "El gimnasio es mi terapia.🧘‍♂️",
        "Haz que tu cuerpo sea la mejor versión de ti mismo.🏋️",
        "Cada repetición te acerca a tu meta.🏆",
        "No hay atajos para ningún lugar que valga la pena.🚶‍♂️",
        "El único límite eres tú.🌟",
        "Transforma 'algún día' en hoy.🚀",
        "Sueña. Cree. Logra.🎯",
        "La fuerza no viene de la capacidad física. Viene de una voluntad indomable.💪",
        "El cambio no llega si no haces nada.⚡",
        "Cuida tu cuerpo. Es el único lugar que tienes para vivir.🏠",
        "El éxito es la suma de pequeños esfuerzos repetidos día tras día.📈",
        "No cuentes los días, haz que los días cuenten.🗓️",
        "La autodisciplina es el puente entre tus metas y tus logros.🌉",
        "El mejor proyecto en el que puedes trabajar eres tú mismo.🛠️",
        "Cada día es una nueva oportunidad para mejorar.🔄",
        "La constancia vence al talento.🏅",
        "Tu salud es una inversión, no un gasto.💰",
        "El compromiso es lo que transforma una promesa en realidad.🔒",
        "No esperes la oportunidad perfecta. Toma el momento y hazlo perfecto.🎯",
        "La motivación te pone en marcha, el hábito te mantiene en movimiento.⚙️",
        "Tu cuerpo logra lo que tu mente cree.💪",
        "El único entrenamiento malo es el que no hiciste.💪"
    ]


    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true'
        setIsDarkMode(isDark)
        document.documentElement.classList.toggle('dark', isDark)

        // Set motivational quote based on the day of the month
        const today = new Date()
        const dayOfMonth = today.getDate() - 1 // Adjust to 0-based index
        setMotivationalQuote(motivationalQuotes[dayOfMonth % motivationalQuotes.length])

        // Set default selected date to tomorrow
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        setSelectedDate(tomorrow.toISOString().split('T')[0])

        // Función para obtener la información del cliente
        const fetchClientInfo = async () => {
            try {
                const response = await fetch(`/api/cliente/${params.id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch client info')
                }
                const data = await response.json()
                setClientInfo(data)
                setVisitsThisMonth(data.visitasEsteMes) // Actualizar el conteo de visitas

                // Cargar las reservas existentes
                if (data.reservas) {
                    setBookings(data.reservas);
                }
            } catch (error) {
                console.error('Error fetching client info:', error)

            }
        }

        fetchClientInfo()
    }, [params.id])

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode
        setIsDarkMode(newDarkMode)
        localStorage.setItem('darkMode', newDarkMode.toString())
        document.documentElement.classList.toggle('dark', newDarkMode)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setIsMobileMenuOpen(false)
    }

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const renderCalendar = () => {
        const days = daysInMonth(currentMonth)
        const firstDay = firstDayOfMonth(currentMonth)
        const calendar = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        for (let i = 0; i < firstDay; i++) {
            calendar.push(<div key={`empty-${i}`} className="p-2"></div>)
        }

        for (let i = 1; i <= days; i++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
            const dateString = date.toISOString().split('T')[0]
            const isSelected = selectedDate === dateString
            const isBooked = bookings.some(booking => booking.fecha === dateString)
            const isPast = date < tomorrow

            calendar.push(
                <button
                    key={i}
                    onClick={() => !isPast && setSelectedDate(dateString)}
                    className={`p-2 m-1 rounded-full transition-colors duration-200
                    ${isSelected ? 'bg-[#2272FF] text-white' : ''}
                    ${isBooked ? 'bg-green-500 text-white' : ''}
                    ${!isSelected && !isBooked && !isPast ? 'hover:bg-[#2272FF] hover:text-white' : ''}
                    ${isPast ? 'text-gray-400 cursor-not-allowed' : ''}
                    ${isSelected || isBooked || isPast ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                    disabled={isBooked || isPast}
                >
                    {i}
                    {isPast && <X size={12} className="absolute top-0 right-0" />}
                </button>
            )
        }

        return calendar
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const bookSession = async (fecha: string, hora: string) => {
        if (selectedDate && clientInfo) {
            try {
                // Combina la fecha y la hora en una sola cadena
                const [hour, period] = hora.split(' ');
                let [hours, minutes] = hour.split(':').map(Number);

                if (period.toUpperCase() === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (period.toUpperCase() === 'AM' && hours === 12) {
                    hours = 0;
                }

                // Crear un objeto Date en UTC
                const dateTimeString = `${fecha}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00Z`;
                const dateTime = new Date(dateTimeString);

                if (isNaN(dateTime.getTime())) {
                    throw new Error('Fecha y hora inválidas');
                }

                const response = await fetch(`/api/cliente/${clientInfo.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        clienteId: clientInfo.id,
                        fecha: dateTime.toISOString(),
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al crear la reserva');
                }

                const newBooking = await response.json();
                setBookings(prevBookings => [...prevBookings, newBooking.reserva]);

                /*  // Agregar al historial
                 const historialResponse = await fetch('/api/historial', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json',
                     },
                     body: JSON.stringify({
                         accion: 'Nueva reserva',
                         descripcion: `Reserva creada para ${dateTime.toLocaleString()}`,
                         usuarioId: clientInfo.id,
                         reservaId: newBooking.reserva.id,
                     }),
                 });
 
                 if (!historialResponse.ok) {
                     console.error('Error al agregar al historial:', await historialResponse.text());
                 } */

            } catch (error) {
                console.error('Error al crear la reserva:', error);
                alert('Error al crear la reserva. Por favor, intenta de nuevo.');
            }
        }
    }

    const cancelBooking = async (id: number) => {
        setAnimatingId(id); // Establece el ID de la reserva que se está animando

        // Espera un momento para permitir que la animación se complete
        setTimeout(async () => {
            try {
                const response = await fetch(`/api/cliente/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Error al cancelar la reserva');
                }

                setBookings(bookings.filter(booking => booking.id !== id));
            } catch (error) {
                console.error('Error al cancelar la reserva:', error);
                alert('Error al cancelar la reserva. Por favor, intenta de nuevo.');
            } finally {
                setAnimatingId(null); // Restablece el ID animado
            }
        }, 300); // Duración de la animación
    }

    const formatAMPM = (hour: number) => {
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const formattedHour = hour % 12 || 12
        return `${formattedHour}:00 ${ampm}`
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
    };

    const formatDate = (dateTimeString: string) => {
        const [date, time] = dateTimeString.split('T');
        return { date, time: time.split('.')[0] }; // Eliminar la parte de los milisegundos
    };

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300`}>
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
                    <nav className="hidden md:flex space-x-4">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'personal' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            Información Personal
                        </button>
                        <button
                            onClick={() => setActiveTab('memberships')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'memberships' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            Historial de Membresías
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'bookings' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            Reservas
                        </button>
                    </nav>
                    <div className="flex items-center">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 mr-2"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-800 py-2 transition-all duration-300">
                        <nav className="flex flex-col space-y-2 px-4">
                            <button
                                onClick={() => handleTabChange('personal')}
                                className={`text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'personal' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                Información Personal
                            </button>
                            <button
                                onClick={() => handleTabChange('memberships')}
                                className={`text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'memberships' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                Historial de Membresías
                            </button>
                            <button
                                onClick={() => handleTabChange('bookings')}
                                className={`text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'bookings' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                Reservas
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {activeTab === 'personal' && clientInfo && (
                    <>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                            <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 relative">
                                    {clientInfo.foto ? (
                                        <Image
                                            src={clientInfo.foto}
                                            alt="foto"
                                            fill
                                            objectFit="cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                            <Camera size={40} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">{clientInfo.nombre}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <CreditCard className="w-5 h-5 mr-2 text-[#2272FF]" />
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">Carnet de Identidad:</p>
                                                <p className="font-semibold">{clientInfo.carnetIdentidad}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-5 h-5 mr-2 text-[#2272FF]" />
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">Teléfono:</p>
                                                <p className="font-semibold">{clientInfo.telefono}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Activity className="w-5 h-5 mr-2 text-[#2272FF]" />
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">Rol:</p>
                                                <p className="font-semibold">{clientInfo.rol}</p>
                                            </div>
                                        </div>
                                        {clientInfo.entrenadorAsignado && (
                                            <div className="flex items-start">
                                                <MessageSquare className="w-5 h-5 mr-2 text-[#2272FF]" />
                                                <div className="flex flex-col">
                                                    <p className="text-gray-600 dark:text-gray-400">Entrenador:</p>
                                                    <div className="flex items-center">
                                                        <p className="font-semibold mr-2">{clientInfo.entrenadorAsignado.nombre}</p>
                                                        <a
                                                            href={`https://wa.me/${clientInfo.entrenadorAsignado.telefono}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
                                                            aria-label="Enviar mensaje a WhatsApp"
                                                        >
                                                            <MessageSquare size={16} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {clientInfo.membresia && (
                                <div className="flex items-center mt-4">
                                    <Calendar className="w-5 h-5 mr-2 text-[#2272FF]" />
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Membresía Actual:</p>
                                        <p className="font-semibold">{clientInfo.membresia.tipo} - {clientInfo.membresia.estadoPago}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(clientInfo.membresia.fechaInicio).toLocaleDateString()} -
                                            {new Date(clientInfo.membresia.fechaFin).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Visitas este mes */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Visitas este mes</h2>
                                <div className="text-4xl font-bold text-[#2272FF]">{visitsThisMonth}</div>
                            </div>
                        </div>

                        {/* Frase motivacional */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Frase del día</h2>
                            <p className="text-lg italic text-gray-600 dark:text-gray-400">&ldquo;{motivationalQuote}&rdquo;</p>
                        </div>
                    </>
                )}

                {/* Membership History */}
                {activeTab === 'memberships' && clientInfo && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Historial de Membresías</h2>
                        {clientInfo.membresias.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                       {clientInfo.membresias.map((membresia) => (
                                    <div key={membresia.id} className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow ${clientInfo.membresia?.id === membresia.id ? 'border-2 border-[#2272FF]' : ''}`}>
                                        <h3 className="text-lg font-semibold mb-2">
                                            Membresía {membresia.tipo === 'mensual' ? 'Mensual' : membresia.tipo === 'trimestral' ? 'Semestral' : 'Anual'}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Fecha de Inicio: {new Date(membresia.fechaInicio).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Fecha de Vencimiento: {new Date(membresia.fechaFin).toLocaleDateString()}
                                        </p>
                                        <p className={`text-sm font-medium ${membresia.estadoPago === 'PAGADO' ? 'text-green-500' : 'text-yellow-500'}`}>
                                            Estado: {membresia.estadoPago}
                                        </p>
                                        {clientInfo.membresia?.id === membresia.id && (
                                            <p className="text-sm font-medium text-[#2272FF]">Membresía Actual</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">No hay historial de membresías disponible.</p>
                        )}
                    </div>
                )}

                {/* Bookings */}
                {activeTab === 'bookings' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Reservas</h2>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <button onClick={prevMonth} className="p-2 rounded-full bg-[#2272FF] text-white hover:bg-[#1b5acc] transition-colors duration-200">
                                    <ChevronLeft size={20} />
                                </button>
                                <h3 className="text-xl font-semibold">
                                    {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                                </h3>
                                <button onClick={nextMonth} className="p-2 rounded-full bg-[#2272FF] text-white hover:bg-[#1b5acc] transition-colors duration-200">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                    <div key={day} className="font-semibold">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {renderCalendar()}
                            </div>
                        </div>
                        {selectedDate && (
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold mb-2">Reservar para {selectedDate}</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {Array.from({ length: 17 }, (_, i) => i + 5).map(hour => (
                                        <button
                                            key={hour}
                                            onClick={() => bookSession(selectedDate, formatAMPM(hour))}
                                            className="px-3 py-2 bg-[#2272FF] text-white rounded-md hover:bg-[#1b5acc] transition-colors duration-200"
                                        >
                                            {formatAMPM(hour)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Reservas Actuales</h3>
                            {bookings.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {bookings.map(({ id, fecha, estado }) => {
                                        const { date, time } = formatDate(fecha);
                                        return (
                                            <motion.div
                                                key={id}
                                                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex justify-between items-center"
                                                initial={{ opacity: newBookingId === id ? 0 : 1, y: newBookingId === id ? 10 : 0 }}
                                                animate={{ opacity: animatingId === id ? 0 : 1, y: animatingId === id ? -10 : 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex items-center">
                                                    <span className="font-medium">{date}</span>
                                                    <span className="ml-2 font-medium">{time}</span>
                                                    <span className={`ml-2 px-1 py-1 text-xs rounded ${estado === 'ACTIVA' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                                        {estado}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        cancelBooking(id);
                                                    }}
                                                    className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 flex items-center"
                                                    aria-label="Cancelar reserva"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">No tienes reservas actualmente.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}