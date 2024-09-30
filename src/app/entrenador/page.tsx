"use client"
import { useState, useEffect } from 'react'
import { Dumbbell, Calendar, Sun, Moon, X, Menu, MessageSquare, DollarSign, Users, Clock, CreditCard, CheckCircle, ArrowUpDown, Phone, IdCard, Award, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { signOut, useSession } from "next-auth/react";
import { addToHistorial } from '@/services/historialService';
import Image from 'next/image';

interface Client {
    id: number;
    nombre: string;
    carnetIdentidad: string;
    telefono: string;
    rol: string;
    foto: string;
    entrenadorId: number | null;
    entrenadorAsignado?: {
        id: number;
        nombre: string;
        telefono: string;
    } | null;
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
    visitasEsteMes: number;
    entrenador: {
        id: number;
        nombre: string;
    } | null;
    lastPayment?: string;
    nextPayment?: string;
    daysUntilPayment?: number;
    membresiaActual?: {
        id: number;
        tipo: string;
        fechaInicio: string;
        fechaFin: string;
        estadoPago: string;
    } | null;
    reservasCliente: {
        id: number;
        fecha: string;
        estado: string;
    }[];
    profileImage?: string; // Nueva propiedad para la imagen de perfil
}

type MiTipo = {
    accion: string;
    descripcion: string;
    usuarioId: number;
    entrenadorId?: number;
    membresiaId?: number;
    reservaId?: number;
    clienteId?: number;
};

export default function TrainerPage() {
    const { data: session } = useSession();
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [activeTab, setActiveTab] = useState('clients')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [schedules, setSchedules] = useState([
        { id: 1, clientName: 'Juan Pérez', date: '2023-05-15', time: '10:00' },
        { id: 2, clientName: 'Ana López', date: '2023-05-16', time: '15:00' },
        { id: 3, clientName: 'Luis Martínez', date: '2023-05-17', time: '18:00' },
    ])
    const [sortCriteria, setSortCriteria] = useState({
        clients: 'name',
        schedules: 'date',
        payments: 'name'
    })
    const router = useRouter();

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true'
        setIsDarkMode(isDark)
        document.documentElement.classList.toggle('dark', isDark)

        const fetchClients = async () => {
            try {
                if (session?.user?.id) {
                    const response = await fetch(`/api/entrenador/${session.user.id}`)
                    if (!response.ok) {
                        throw new Error('Failed to fetch clients')
                    }
                    const data = await response.json()
                    setClients(data)

                    /*    // Agregar al historial
                       await addToHistorial({
                           accion: 'Acceso a página de entrenador',
                           descripcion: 'Entrenador accedió a su página',
                           usuarioId: parseInt(session.user.id),
                       }); */
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }

        fetchClients()
    }, [session])

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

    const handlePaymentUpdate = async (clientId: number, paid: boolean, newMembershipType: string) => {
        try {
            const response = await fetch(`/api/entrenador/${clientId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clientId, paid, newMembershipType }),
            });

            if (!response.ok) {
                throw new Error('Failed to update membership');
            }

            const updatedClient = await response.json();
            setClients(clients.map(client => client.id === clientId ? updatedClient : client));

            // Agregar al historial
            await addToHistorial({
                accion: 'Actualización de membresía',
                descripcion: `Membresía actualizada para el cliente ${updatedClient.nombre}`,
                usuarioId: parseInt(session?.user?.id ?? '0'), // Maneja el caso donde session es null
            });
        } catch (error) {
            console.error('Error updating membership:', error);
        }
    };

    const handleMembershipChange = (clientId: number, newMembershipType: string) => {
        setClients(clients.map(client => {
            if (client.id === clientId) {
                return {
                    ...client,
                    membresiaActual: {
                        ...client.membresiaActual,
                        tipo: newMembershipType,
                        id: client.membresiaActual?.id ?? 0, // Ensure 'id' is always a number
                        fechaInicio: client.membresiaActual?.fechaInicio ?? '',
                        fechaFin: client.membresiaActual?.fechaFin ?? '',
                        estadoPago: client.membresiaActual?.estadoPago ?? ''
                    }
                }
            }
            return client
        }))
    }

    const handleSortChange = (tab: string, criteria: string) => {
        setSortCriteria(prev => ({ ...prev, [tab]: criteria }))
    }

    const sortedClients = [...clients].sort((a, b) => {
        switch (sortCriteria.clients) {
            case 'name':
                return a.nombre.localeCompare(b.nombre)
            case 'membershipType':
                return (a.membresia?.tipo || '').localeCompare(b.membresia?.tipo || '')
            case 'clientId':
                return a.id - b.id
            default:
                return 0
        }
    })

    const sortedSchedules = clients.flatMap(client =>
        client.reservasCliente.map(reserva => {
            const [date, time] = reserva.fecha.split('T');
            return {
                id: reserva.id,
                clientName: client.nombre,
                date,
                time: time.slice(0, 5), // Asegurarse de que solo se tomen los primeros 5 caracteres de la hora
            };
        })
    ).sort((a, b) => {
        switch (sortCriteria.schedules) {
            case 'date':
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            case 'clientName':
                return a.clientName.localeCompare(b.clientName)
            case 'time':
                return a.time.localeCompare(b.time)
            default:
                return 0
        }
    })

    const sortedPayments = [...clients].sort((a, b) => {
        switch (sortCriteria.payments) {
            case 'name':
                return a.nombre.localeCompare(b.nombre)
            case 'membershipType':
                return (a.membresia?.tipo || '').localeCompare(b.membresia?.tipo || '')
            case 'nextPayment':
                return new Date(a.nextPayment || '').getTime() - new Date(b.nextPayment || '').getTime()
            case 'daysUntilPayment':
                return (a.daysUntilPayment ?? 0) - (b.daysUntilPayment ?? 0)
            default:
                return 0
        }
    })

    const SortDropdown = ({ tab, options }: { tab: string; options: { value: string; label: string }[] }) => (
        <div className="mb-6 flex items-center justify-end">
            <div className="relative">
                <select
                    value={sortCriteria[tab as keyof typeof sortCriteria]}
                    onChange={(e) => handleSortChange(tab, e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2272FF] focus:border-transparent"
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                    <ArrowUpDown size={16} />
                </div>
            </div>
        </div>
    )

    const handleSignOut = async () => {
        // Agregar al historial antes de cerrar sesión
        /*  try {
             if (session && session.user) {
                 await addToHistorial({
                     accion: 'Cierre de sesión',
                     descripcion: 'Entrenador cerró sesión',
                     usuarioId: parseInt(session.user.id),
                 });
             } else {
                 console.error('Error: sesión no encontrada.');
             }
         } catch (error) {
             console.error('Error al agregar al historial:', error);
         } */

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

    const handleCancelReservation = async (reservationId: number) => {
        try {
            const response = await fetch(`/api/entrenador/${reservationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al cancelar la reserva');
            }

            const updatedReservation = await response.json();
            setSchedules(schedules.filter(schedule => schedule.id !== reservationId));

            // Agregar al historial
            /*    if (session && session.user) {
                   await addToHistorial({
                       accion: 'Cancelación de reserva',
                       descripcion: `Reserva cancelada para el cliente ${updatedReservation.cliente.nombre}`,
                       usuarioId: parseInt(session.user.id),
                       reservaId: reservationId,
                   });
               } else {
                   console.error('Error: sesión no encontrada.');
               } */
        } catch (error) {
            console.error('Error al cancelar la reserva:', error);
            alert('Error al cancelar la reserva. Por favor, intenta de nuevo.');
        }
    };

    const ProfileImage = ({ src, alt }: { src?: string; alt: string }) => {
        const [imgSrc, setImgSrc] = useState(src);

        return (
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={alt}
                        width={64}
                        height={64}
                        className="object-cover"
                        onError={() => setImgSrc('/default-profile.jpg')}
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <User size={32} className="text-gray-400" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 ${isDarkMode ? 'dark' : ''} transition-colors duration-300`}>
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
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
                            onClick={() => handleTabChange('clients')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeTab === 'clients' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <Users className="inline-block mr-1" size={16} />
                            Mis Clientes
                        </button>
                        <button
                            onClick={() => handleTabChange('schedules')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeTab === 'schedules' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <Clock className="inline-block mr-1" size={16} />
                            Horarios
                        </button>
                        {/*     <button
                            onClick={() => handleTabChange('payments')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeTab === 'payments' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <DollarSign className="inline-block mr-1" size={16} />
                            Pagos
                        </button> */}
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
            </header>

            {/* Mobile Menu */}
            <div className={`md:hidden bg-white dark:bg-gray-800 shadow-md overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-60' : 'max-h-0'}`}>
                <div className="container mx-auto px-4 py-2">
                    <button
                        onClick={() => handleTabChange('clients')}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeTab === 'clients' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <Users className="inline-block mr-1" size={16} />
                        Mis Clientes
                    </button>
                    <button
                        onClick={() => handleTabChange('schedules')}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeTab === 'schedules' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <Clock className="inline-block mr-1" size={16} />
                        Horarios
                    </button>
                    {/*     <button
                        onClick={() => handleTabChange('payments')}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeTab === 'payments' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <DollarSign className="inline-block mr-1" size={16} />
                        Pagos
                    </button> */}
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Assigned Clients Panel */}
                {activeTab === 'clients' && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold mb-4">Mis Clientes</h2>
                        <SortDropdown
                            tab="clients"
                            options={[
                                { value: 'name', label: 'Nombre' },
                                { value: 'membershipType', label: 'Tipo de Membresía' },
                                { value: 'clientId', label: 'ID de Cliente' },
                            ]}
                        />
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {sortedClients.map((client, index) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="flex flex-col items-center">
                                        <ProfileImage src={client.foto} alt={client.nombre} />
                                        <h3 className="text-xl font-semibold mb-2">{client.nombre}</h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                        <IdCard className="inline-block mr-2" size={16} />
                                        ID: {client.carnetIdentidad}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                        <Phone className="inline-block mr-2" size={16} />
                                        Teléfono: {client.telefono}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                                        <Award className="inline-block mr-2" size={16} />
                                        Membresía: {client.membresiaActual?.tipo}
                                    </p>
                                    <button
                                        className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center justify-center transform hover:scale-105"
                                        onClick={() => window.open(`https://wa.me/${client.telefono}`, '_blank')}
                                    >
                                        <MessageSquare size={18} className="mr-2" />
                                        Mensaje
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Schedule Management Section */}
               {activeTab === 'schedules' && session?.user && 'entrenadorId' in session.user && (
                    <div className="animate-fadeIn">


                        <h2 className="text-2xl font-bold mb-4">Horarios</h2>

                        <SortDropdown

                            tab="schedules"

                            options={[

                                { value: 'date', label: 'Fecha' },
                                { value: 'clientName', label: 'Nombre del Cliente' },

                                { value: 'time', label: 'Hora' },

                            ]}

                        />

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {sortedSchedules.map((schedule, index) => {

                                const client = clients.find(c => c.nombre === schedule.clientName);

                                return (
                                    <div key={schedule.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>

                                        <div className="flex items-center mb-2">
                                            <ProfileImage src={client?.foto} alt={schedule.clientName} />

                                            <h3 className="text-lg font-semibold ml-2">{schedule.clientName}</h3>

                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-1">
                                            <Calendar className="inline-block mr-1" size={16} />

                                            {schedule.date}

                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">

                                            <Clock className="inline-block mr-1" size={16} />

                                            {schedule.time}
                                        </p>

                                        <button
                                            className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 flex items-center justify-center transform hover:scale-105"
                                            onClick={() => handleCancelReservation(schedule.id)}

                                        >
                                            <X size={18} className="mr-2" />

                                            Cancelar

                                        </button>

                                    </div>
                                );
                            })}

                        </div>

                    </div>
                )}

                {/* Payments Management Section */}
                {activeTab === 'payments' && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold mb-4">Gestión de Pagos</h2>
                        <SortDropdown
                            tab="payments"
                            options={[
                                { value: 'name', label: 'Nombre' },
                                { value: 'membershipType', label: 'Tipo de Membresía' },
                                { value: 'nextPayment', label: 'Próximo Pago' },
                                { value: 'daysUntilPayment', label: 'Días Restantes' },
                            ]}
                        />
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {sortedPayments.map((client, index) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="flex flex-col items-center mb-4">
                                        <ProfileImage src={client.foto} alt={client.nombre} />
                                        <h3 className="text-xl font-semibold">{client.nombre}</h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">ID: {client.id}</p>
                                    <div className="mb-2">
                                        <label htmlFor={`membership-${client.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo de Membresía
                                        </label>
                                        <select
                                            id={`membership-${client.id}`}
                                            value={client.membresiaActual?.tipo || ''}
                                            onChange={(e) => handleMembershipChange(client.id, e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#2272FF] focus:border-[#2272FF] dark:text-white"
                                        >
                                            <option value="MENSUAL">Mensual</option>
                                            <option value="TRIMESTRAL">Trimestral</option>
                                            <option value="ANUAL">Anual</option>
                                        </select>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Último Pago: {client.lastPayment}</p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Próximo Pago: {client.nextPayment}</p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Días Restantes: {client.daysUntilPayment}</p>
                                    <button
                                        onClick={() => handlePaymentUpdate(client.id, true, client.membresiaActual?.tipo || 'MENSUAL')}
                                        className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center justify-center transform hover:scale-105"
                                    >
                                        <CheckCircle size={18} className="mr-2" />
                                        Marcar como Pagado
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}