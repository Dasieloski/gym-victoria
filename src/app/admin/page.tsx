"use client"
import { useState, useEffect } from 'react'
import { Dumbbell, Users, CreditCard, Calendar, BarChart, Sun, Moon, Edit, Trash, Plus, ChevronLeft, ChevronRight, Search, Menu, UserPlus, History, UserCog } from 'lucide-react'
import Link from 'next/link'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClientType } from '@/types/client';
import { Booking } from '@/types/booking';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)


// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; message: string; }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                <p className="mb-4 text-lg">{message}</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const [sortBy, setSortBy] = useState('')
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: number | null; type: string }>({ isOpen: false, id: null, type: '' })
    const [trainers, setTrainers] = useState([])
    const [editingClient, setEditingClient] = useState<{ id: string; nombre: string; telefono: string; entrenadorAsignadoId: string | null } | null>(null)
    const [clientes, setClientes] = useState<ClientType[]>([]); // Definir el tipo de estado
    const [clientesEspera, setClientesEspera] = useState([])
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [bookings, setBookings] = useState<Booking[]>([]); // Asegúrate de que 'bookings' sea un array de 'Booking'
    type User = { id: number; rol: string; /* otros campos */ };
    const [users, setUsers] = useState<User[]>([]); // Define el tipo aquí
    const [historiales, setHistoriales] = useState([])
    const [clientesConMembresia, setClientesConMembresia] = useState([])
    const [searchClients, setSearchClients] = useState('');
    const [searchNewClients, setSearchNewClients] = useState('');
    const [searchMemberships, setSearchMemberships] = useState('');
    const [searchHistory, setSearchHistory] = useState('');
    const [searchUsers, setSearchUsers] = useState(''); // Agregar estado para búsqueda de usuarios
    const [previousIngresosMensuales, setPreviousIngresosMensuales] = useState(0);
    const [previousTotalClientes, setPreviousTotalClientes] = useState(0);

    const filteredClients = clientes.filter((client: ClientType) =>
    (client.nombre?.toLowerCase().includes(searchClients.toLowerCase()) ||
        client.carnetIdentidad?.toLowerCase().includes(searchClients.toLowerCase()) ||
        client.telefono?.toLowerCase().includes(searchClients.toLowerCase()))
    );

    const filteredNewClients = clientesEspera.filter((client: { nombre: string; username: string; carnetIdentidad: string }) =>
        client.nombre.toLowerCase().includes(searchNewClients.toLowerCase()) ||
        client.username.toLowerCase().includes(searchNewClients.toLowerCase()) ||
        client.carnetIdentidad.toLowerCase().includes(searchNewClients.toLowerCase())
    );

    // Asegúrate de que 'clientesConMembresia' tenga un tipo definido
    const filteredMemberships = clientesConMembresia.filter((client: { nombre: string; membresiaActual: { tipo: string } }) =>
        client.nombre.toLowerCase().includes(searchMemberships.toLowerCase()) ||
        client.membresiaActual.tipo.toLowerCase().includes(searchMemberships.toLowerCase())
    );

    const filteredHistory = historiales.filter((item: { accion: string; descripcion: string; usuario: { nombre: string } }) =>
        item.accion.toLowerCase().includes(searchHistory.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchHistory.toLowerCase()) ||
        item.usuario.nombre.toLowerCase().includes(searchHistory.toLowerCase())
    );

    // Filtrar usuarios según la búsqueda
    const filteredUsers = users.filter((user: any) => // Cambiar el tipo de user a any
        user.nombre.toLowerCase().includes(searchUsers.toLowerCase()) ||
        user.rol.toLowerCase().includes(searchUsers.toLowerCase())
    );

    // Calcular ingresos mensuales: 2000 pesos por cada cliente con membresía activa
    const ingresosMensuales = clientesConMembresia.length * 2000;
    const totalClientes = users.filter((user: { rol: string }) => user.rol === 'CLIENTE').length;

    // Calcular porcentajes
    const ingresosPorcentaje = previousIngresosMensuales ? ((ingresosMensuales - previousIngresosMensuales) / previousIngresosMensuales) * 100 : 0;
    const clientesPorcentaje = previousTotalClientes ? ((totalClientes - previousTotalClientes) / previousTotalClientes) * 100 : 0;

    // Actualizar valores anteriores al final del efecto
    useEffect(() => {
        setPreviousIngresosMensuales(ingresosMensuales);
        setPreviousTotalClientes(totalClientes);
    }, [ingresosMensuales, totalClientes]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch('/api/admin/bookings');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al obtener las reservas');
                }
                const data = await response.json();
                console.log('Reservas obtenidas:', data);
                setBookings(data); // Actualizado para asignar data directamente
            } catch (error) {
                console.error('Error al obtener las reservas:', error as Error);
                toast.error(`Error al cargar las reservas: ${(error as Error).message}`);
            }
        };

        fetchBookings();
    }, []);

    useEffect(() => {
        const fetchHistoriales = async () => {
            try {
                const response = await fetch('/api/historial');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setHistoriales(data);
            } catch (error) {
                console.error('Error al obtener los historiales:', error);
                // Puedes manejar el error aquí, por ejemplo, mostrando un mensaje al usuario
            }
        };

        fetchHistoriales();
    }, []);

    useEffect(() => {
        const fetchMemberships = async () => {
            try {
                const response = await fetch('/api/admin/memberships');
                if (!response.ok) {
                    throw new Error('Error al obtener las membresías');
                }
                const data = await response.json();
                console.log('Datos de membresías:', data); // Verifica los datos aquí
                setClientesConMembresia(data);
            } catch (error) {
                console.error('Error al obtener las membresías:', error);
                toast.error(`Error al cargar las membresías: ${(error as Error).message}`);
            }
        };

        fetchMemberships();
    }, []);



    const confirmDelete = async () => {
        if (deleteConfirmation.id && deleteConfirmation.type) {
            try {
                const response = await fetch(`/api/admin/${deleteConfirmation.type === 'client' ? 'clientes' : 'bookings'}?id=${deleteConfirmation.id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error desconocido al eliminar el elemento');
                }

                if (deleteConfirmation.type === 'client') {
                    setClientes(prevClientes => prevClientes.filter((client: ClientType) => Number(client.id) !== deleteConfirmation.id));
                    toast.success('Cliente eliminado con éxito');
                } else if (deleteConfirmation.type === 'booking') {
                    setBookings(prevBookings =>
                        prevBookings.filter((booking: { id: number }) => booking.id !== deleteConfirmation.id)
                    );
                    toast.success('Reserva eliminada con éxito');
                }

                setDeleteConfirmation({ isOpen: false, id: null, type: '' });
            } catch (error) {
                console.error(`Error al eliminar el ${deleteConfirmation.type}:`, error);
                toast.error(`Error al eliminar el ${deleteConfirmation.type}: ${(error as Error).message}`);
            }
        }
    };
    useEffect(() => {
        const fetchNewClients = async () => {
            try {
                const response = await fetch('/api/admin/newClients');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al obtener los nuevos clientes');
                }
                const data = await response.json();
                setClientesEspera(data); // Asegúrate de que los datos se están asignando correctamente
            } catch (error) {
                console.error('Error al obtener los nuevos clientes:', error);
                toast.error(`Error al cargar los nuevos clientes: ${(error as Error).message}`);
            }
        };

        fetchNewClients();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/admin/clientes');
                const data = await response.json();
                setClientes(data.clientes);
                setTrainers(data.entrenadores);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
                toast.error('Error al cargar los clientes');
            }
        };

        fetchData();
    }, []);

    const handleConvertToClient = async (id: string) => { // Especificar el tipo de 'id'
        try {
            const response = await fetch(`/api/admin/newClients`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al convertir el cliente');
            }

            const updatedUser = await response.json();
            setClientesEspera(prevClientes =>
                prevClientes.filter((c: { id: number }) => c.id !== updatedUser.id)
            );
            toast.success('Cliente convertido con éxito');
        } catch (error) {
            console.error('Error al convertir el cliente:', error);
            toast.error(`Error al convertir el cliente: ${(error as Error).message}`);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/admin/roles');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, []);

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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setIsMobileMenuOpen(false)
    }

    const sortItems = (items: { [key: string]: any }[]) => {
        if (!items) return [];
        if (sortBy) {
            return [...items].sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return -1;
                if (a[sortBy] > b[sortBy]) return 1;
                return 0;
            });
        }
        return items;
    }

    const handleDelete = (id: number | null, type: string) => { // Cambiado a 'number | null'
        setDeleteConfirmation({ isOpen: true, id, type });
    };

    const handleEditClient = (client: { id: string; nombre: string; telefono: string; entrenadorAsignadoId: string | null } | null) => {
        setEditingClient(client);
    };

    const handleSaveClient = async () => {
        if (!editingClient) {
            console.error('No hay cliente en edición');
            return;
        }

        try {
            const response = await fetch('/api/admin/clientes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingClient.id,
                    nombre: editingClient.nombre,
                    telefono: editingClient.telefono,
                    entrenadorAsignadoId: editingClient.entrenadorAsignadoId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al actualizar el cliente');
            }

            const updatedClient = await response.json();
            setClientes((prevClientes: ClientType[]) =>
                prevClientes.map((c) => (c.id === updatedClient.id ? updatedClient : c))
            );
            setEditingClient(null);
            toast.success('Cliente editado con éxito');
            // Cerrar el diálogo de edición
            (document.querySelector('[data-state="open"]') as HTMLElement)?.click();
        } catch (error) {
            console.error('Error al guardar el cliente:', error);
            toast.error(`Error al guardar el cliente: ${(error as Error).message}`);
        }
    };

    // Calcular asistencia semanal
    const asistenciaSemanal = [0, 0, 0, 0, 0, 0, 0]; // Array para almacenar la asistencia de cada día

    // Verifica si hoy es domingo
    const today = new Date();
    if (today.getDay() === 0) {
        // Reinicia el conteo si es domingo
        asistenciaSemanal.fill(0);
    }

    // Iterar sobre las reservas y contar los clientes por día
    bookings.forEach(booking => {
        const fecha = new Date(booking.fecha);
        const dia = fecha.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        if (dia >= 0 && dia <= 6) {
            asistenciaSemanal[dia] += 1; // Incrementar el contador para el día correspondiente
        }
    });

    const barChartData = {
        labels: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        datasets: [
            {
                label: 'Asistencia Semanal',
                data: asistenciaSemanal,
                backgroundColor: 'rgba(34, 114, 255, 0.6)',
                borderColor: 'rgba(34, 114, 255, 1)',
                borderWidth: 1,
            },
        ],
    }

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold' as const,
                    },
                    color: isDarkMode ? 'white' : 'black',
                },
            },
            title: {
                display: true,
                text: 'Asistencia Semanal',
                font: {
                    size: 18,
                    weight: 'bold' as const,
                },
                color: isDarkMode ? 'white' : 'black',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    color: isDarkMode ? 'white' : 'black',
                    font: {
                        size: 12,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: isDarkMode ? 'white' : 'black',
                    font: {
                        size: 12,
                    },
                },
            },
        },
    }

    // Verifica el contenido de clientesConMembresia
    console.log('Clientes con membresía:', clientesConMembresia);

    // Calcular la distribución de membresías
    const totalMensual = clientesConMembresia.filter((client: { membresiaActual?: { tipo: string } }) => client.membresiaActual?.tipo === 'MENSUAL').length;
    const totalTrimestral = clientesConMembresia.filter((client: { membresiaActual?: { tipo: string } }) => client.membresiaActual?.tipo === 'TRIMESTRAL').length;
    const totalAnual = clientesConMembresia.filter((client: { membresiaActual?: { tipo: string } }) => client.membresiaActual?.tipo === 'ANUAL').length;

    // Verifica los totales calculados
    console.log('Distribución de membresías:', { totalMensual, totalTrimestral, totalAnual });

    const pieChartData = {
        labels: ['Mensual', 'Trimestral', 'Anual'],
        datasets: [
            {
                data: [totalMensual, totalTrimestral, totalAnual],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderWidth: 1,
            },
        ],
    }

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold' as const,
                    },
                    color: isDarkMode ? 'white' : 'black',
                },
            },
            title: {
                display: true,
                text: 'Distribución de Membresías',
                font: {
                    size: 18,
                    weight: 'bold' as const,
                },
                color: isDarkMode ? 'white' : 'black',
            },
        },
    }

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 ${isDarkMode ? 'dark' : ''}`}>
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <Link href="/" className="flex items-center mb-5 font-bold text-2xl text-[#2272FF]">
                        <Dumbbell className="mr-2" />
                        GYM-VICTORIA
                    </Link>
                    <ul className="space-y-2 font-medium">
                        <li>
                            <button onClick={() => handleTabChange('dashboard')} className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'dashboard' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <BarChart className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                <span className="ml-3">Dashboard</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleTabChange('clients')} className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'clients' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <Users className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                <span className="ml-3">Clientes</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleTabChange('memberships')} className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'memberships' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <CreditCard className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                <span className="ml-3">Membresías</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleTabChange('bookings')} className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'bookings' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <Calendar className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                <span className="ml-3">Reservas</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleTabChange('newClients')} className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'newClients' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <UserPlus className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                <span className="ml-3">Nuevos Clientes</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleTabChange('roles')} className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'roles' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <UserCog className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                <span className="ml-3">Gestionar Roles</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleTabChange('history')} className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'history' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <History className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                <span className="ml-3">Historial</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <div className="p-4 md:ml-64">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <button onClick={toggleMobileMenu} className="md:hidden p-2 mr-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-[#2272FF] text-white hover:bg-[#1b5acc] transition-colors duration-200"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>

                {/* Dashboard */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="h-80">
                                <Bar data={barChartData} options={barChartOptions} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="h-80">
                                {totalMensual || totalTrimestral || totalAnual ? (
                                    <Pie data={pieChartData} options={pieChartOptions} />
                                ) : (
                                    <p>No hay datos para mostrar en el gráfico.</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-2">Total Clientes</h3>
                            <p className="text-4xl font-bold text-[#2272FF]">{totalClientes}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{clientesPorcentaje.toFixed(2)}% desde hace 30 días</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-2">Ingresos Mensuales</h3>
                            <p className="text-4xl font-bold text-[#2272FF]">{ingresosMensuales} CUP</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{ingresosPorcentaje.toFixed(2)}% desde hace 30 días</p>
                        </div>
                    </div>
                )}

                {/* Clients Management */}
                {activeTab === 'clients' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div className="relative w-full sm:w-auto">
                                <Input
                                    type="text"
                                    placeholder="Buscar clientes..."
                                    className="w-full sm:w-64 pl-10 pr-4"
                                    onChange={(e) => setSearchClients(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <Select onValueChange={(value) => setSortBy(value)}>
                                <SelectTrigger className="w-full sm:w-auto">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nombre">Nombre</SelectItem>
                                    <SelectItem value="id">ID</SelectItem>
                                    <SelectItem value="membresiaActual.tipo">Tipo de Membresía</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(filteredClients).map((client) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{client.nombre}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID: {client.id}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Teléfono: {client.telefono}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carnet: {client.carnetIdentidad}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Membresía Actual: {client.membresiaActual?.tipo || 'Sin membresía'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Entrenador: {client.entrenadorAsignado ? client.entrenadorAsignado.nombre : 'Sin entrenador asignado'}
                                    </p>
                                    <div className="flex justify-end">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClient({
                                                    id: client.id,
                                                    nombre: client.nombre,
                                                    telefono: client.telefono,
                                                    entrenadorAsignadoId: client.entrenadorAsignadoId
                                                })}>
                                                    <Edit size={18} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Editar Cliente</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="name" className="text-right">
                                                            Nombre
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            value={editingClient?.nombre || ''}
                                                            onChange={(e) => setEditingClient({
                                                                ...editingClient,
                                                                nombre: e.target.value,
                                                                id: editingClient?.id || '',
                                                                telefono: editingClient?.telefono || '',
                                                                entrenadorAsignadoId: editingClient?.entrenadorAsignadoId || ''
                                                            })}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="phone" className="text-right">
                                                            Teléfono
                                                        </Label>
                                                        <Input
                                                            id="phone"
                                                            value={editingClient?.telefono || ''}
                                                            onChange={(e) => setEditingClient({
                                                                id: editingClient?.id || '',
                                                                nombre: editingClient?.nombre || '',
                                                                telefono: e.target.value,
                                                                entrenadorAsignadoId: editingClient?.entrenadorAsignadoId || ''
                                                            })}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="trainer" className="text-right">
                                                            Entrenador
                                                        </Label>
                                                        <Select
                                                            value={editingClient?.entrenadorAsignadoId?.toString() || ''} // Cambiado a string
                                                            onValueChange={(value) => setEditingClient({
                                                                ...editingClient,
                                                                entrenadorAsignadoId: value === 'Sin entrenador' ? null : value,
                                                                id: editingClient?.id || '',
                                                                nombre: editingClient?.nombre || '',
                                                                telefono: editingClient?.telefono || ''
                                                            })}>
                                                            <SelectTrigger className="col-span-3">
                                                                <SelectValue placeholder="Seleccionar entrenador" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Sin entrenador">Sin entrenador</SelectItem>
                                                                {trainers.map((trainer: { id: number; nombre: string }) => (
                                                                    <SelectItem key={trainer.id} value={trainer.id.toString()}>
                                                                        {trainer.nombre}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleSaveClient}>Guardar cambios</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(client.id, 'client')}>
                                            <Trash size={18} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Memberships Management */}
                {activeTab === 'memberships' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div className="relative w-full sm:w-auto">
                                <Input
                                    type="text"
                                    placeholder="Buscar membresías..."
                                    className="w-full sm:w-64 pl-10 pr-4"
                                    onChange={(e) => setSearchMemberships(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <Select onValueChange={(value) => setSortBy(value)}>
                                <SelectTrigger className="w-full sm:w-auto">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="clientName">Nombre del Cliente</SelectItem>
                                    <SelectItem value="type">Tipo de Membresía</SelectItem>
                                    <SelectItem value="startDate">Fecha de Inicio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(filteredMemberships).map((client) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{client.nombre}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tipo: {client.membresiaActual.tipo}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inicio: {new Date(client.membresiaActual.fechaInicio).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fin: {new Date(client.membresiaActual.fechaFin).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Estado: {client.membresiaActual.estadoPago}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bookings Management */}
                {activeTab === 'bookings' && (
                    <div>
                        {/* ...otros componentes como el buscador y select de ordenación... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(bookings || []).map((booking) => (
                                <div key={booking.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{booking.cliente.nombre}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Fecha: {new Date(booking.fecha).toLocaleString()} {/* Muestra la fecha completa */}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Entrenador: {booking.entrenadorNombre}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Estado: {booking.estado}
                                    </p>
                                    <div className="flex justify-end">
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(booking.id, 'booking')}>
                                            <Trash size={18} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Clients */}
                {activeTab === 'newClients' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div className="relative w-full sm:w-auto">
                                <Input
                                    type="text"
                                    placeholder="Buscar nuevos clientes..."
                                    className="w-full sm:w-64 pl-10 pr-4"
                                    onChange={(e) => setSearchNewClients(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <Select onValueChange={(value) => setSortBy(value)}>
                                <SelectTrigger className="w-full sm:w-auto">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nombre">Nombre</SelectItem>
                                    <SelectItem value="username">Nombre de Usuario</SelectItem>
                                    <SelectItem value="carnetIdentidad">Carnet de Identidad</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(filteredNewClients).map((client) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{client.nombre}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usuario: {client.username}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carnet: {client.carnetIdentidad}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Teléfono: {client.telefono}</p>
                                    <Button className="w-full" onClick={() => handleConvertToClient(client.id)}>
                                        Convertir en Cliente Oficial
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Roles Management */}
                {activeTab === 'roles' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div className="relative w-full sm:w-auto">
                                <Input
                                    type="text"
                                    placeholder="Buscar usuarios..."
                                    className="w-full sm:w-64 pl-10 pr-4"
                                    onChange={(e) => setSearchUsers(e.target.value)} // Actualizar estado de búsqueda
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <Select onValueChange={(value) => setSortBy(value)}>
                                <SelectTrigger className="w-full sm:w-auto">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nombre">Nombre</SelectItem>
                                    <SelectItem value="rol">Rol</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(filteredUsers).map((user) => ( // Usar filteredUsers aquí
                                <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{user.nombre}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Rol actual: {user.rol}</p>
                                    <Select
                                        onValueChange={async (value) => {
                                            try {
                                                const response = await fetch('/api/admin/updateRole', {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({ id: user.id, rol: value }),
                                                });

                                                if (!response.ok) {
                                                    const errorData = await response.json();
                                                    throw new Error(errorData.error || 'Error desconocido al actualizar el rol');
                                                }

                                                const updatedUser = await response.json();
                                                setUsers(prevUsers =>
                                                    prevUsers.map(u =>
                                                        u.id === updatedUser.id ? { ...u, rol: updatedUser.rol } : u
                                                    )
                                                );
                                                toast.success('Rol actualizado con éxito');
                                            } catch (error: unknown) {
                                                if (error instanceof Error) {
                                                    console.error('Error detallado al actualizar el rol:', error);
                                                    toast.error(`Error al actualizar el rol: ${error.message}`);
                                                } else {
                                                    console.error('Error desconocido al actualizar el rol:', error);
                                                    toast.error('Error al actualizar el rol: error desconocido');
                                                }
                                            }
                                        }}
                                        defaultValue={user.rol}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                            <SelectItem value="ENTRENADOR">ENTRENADOR</SelectItem>
                                            <SelectItem value="CLIENTE">CLIENTE</SelectItem>
                                            <SelectItem value="CLIENTEESPERA">CLIENTEESPERA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* History */}
                {activeTab === 'history' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div className="relative w-full sm:w-auto">
                                <Input
                                    type="text"
                                    placeholder="Buscar en historial..."
                                    className="w-full sm:w-64 pl-10 pr-4"
                                    onChange={(e) => setSearchHistory(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <Select onValueChange={(value) => setSortBy(value)}>
                                <SelectTrigger className="w-full sm:w-auto">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fecha">Fecha</SelectItem>
                                    <SelectItem value="accion">Acción</SelectItem>
                                    <SelectItem value="usuario">Usuario</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(filteredHistory).map((item) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{item.accion}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Descripción: {item.descripcion}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usuario: {item.usuario.nombre}</p>
                                    {item.entrenador && <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entrenador: {item.entrenador.usuario.nombre}</p>}
                                    {item.membresia && <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Membresía: {item.membresia.tipo}</p>}
                                    {item.reserva && <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reserva: {new Date(item.reserva.fecha).toLocaleString()}</p>}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fecha: {new Date(item.fecha).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirmation Dialog */}
                <ConfirmationDialog
                    isOpen={deleteConfirmation.isOpen}
                    onClose={() => setDeleteConfirmation({ isOpen: false, id: null, type: '' })}
                    onConfirm={confirmDelete}
                    message="¿Está seguro de que desea eliminar este elemento?"
                />
            </div>
        </div>
    )
}