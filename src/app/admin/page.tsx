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
import React from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ClientType } from '@/types/client'
import { Booking } from '@/types/booking'
import Image from 'next/image'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MessageCircle } from 'lucide-react';
import dayjs from '@/lib/dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface User {
    id: string;
    rol: string;
    nombre: string;
    foto: string;
    // ... otros campos necesarios
}

interface Historial {
    accion: string;
    descripcion: string;
    usuario: {
        nombre: string;
    };
    // otros campos si es necesario
}

interface ProfileImageProps {
    src?: string;
    alt: string;
}

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

const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt }) => (
    <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
        {src ? (
            <Image src={src} alt={alt} width={64} height={64} className="object-cover" unoptimized />
        ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <Users size={32} className="text-gray-400" />
            </div>
        )}
    </div>
);

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
    const [userRoles, setUserRoles] = useState<User[]>([]);
    const [historiales, setHistoriales] = useState([])
    const [clientesConMembresia, setClientesConMembresia] = useState<ClientType[]>([])
    const [searchClients, setSearchClients] = useState('');
    const [searchNewClients, setSearchNewClients] = useState('');
    const [searchMemberships, setSearchMemberships] = useState('');
    const [searchHistory, setSearchHistory] = useState('');
    const [searchUsers, setSearchUsers] = useState(''); // Agregar estado para búsqueda de usuarios
    const [previousIngresosMensuales, setPreviousIngresosMensuales] = useState(0);
    const [previousTotalClientes, setPreviousTotalClientes] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [clientesProximosPagos, setClientesProximosPagos] = useState<ClientType[]>([]);
    const itemsPerPage = 10; // Puedes ajustar este valor según tus necesidades
    const [membresiasHoy, setMembresiasHoy] = useState(0);
    const [selectedMembership, setSelectedMembership] = useState<{
        [key: number]: { tipo: string; isAdvanced: boolean }
    }>({});

    const filteredClients = Array.isArray(clientes) ? clientes.filter((client: ClientType) =>
    (client.nombre?.toLowerCase().includes(searchClients.toLowerCase()) ||
        client.carnetIdentidad?.toLowerCase().includes(searchClients.toLowerCase()) ||
        client.telefono?.toLowerCase().includes(searchClients.toLowerCase()))
    ) : [];

    const filteredNewClients = Array.isArray(clientesEspera) ? clientesEspera.filter((client: { nombre: string; username: string; carnetIdentidad: string }) =>
        client.nombre.toLowerCase().includes(searchNewClients.toLowerCase()) ||
        client.username.toLowerCase().includes(searchNewClients.toLowerCase()) ||
        client.carnetIdentidad.toLowerCase().includes(searchNewClients.toLowerCase())
    ) : [];

    const filteredMemberships = Array.isArray(clientesConMembresia) ? clientesConMembresia.filter((client: ClientType) =>
        client.nombre.toLowerCase().includes(searchMemberships.toLowerCase()) ||
        client.membresiaActual?.tipo.toLowerCase().includes(searchMemberships.toLowerCase())
    ) : [];

    const filteredHistory = Array.isArray(historiales) ? historiales.filter((item: Historial) =>
        item.accion.toLowerCase().includes(searchHistory.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchHistory.toLowerCase()) ||
        item.usuario.nombre.toLowerCase().includes(searchHistory.toLowerCase())
    ) : [];

    const filteredUsers = Array.isArray(userRoles) ? userRoles.filter((user: User) =>
        user.nombre.toLowerCase().includes(searchUsers.toLowerCase()) ||
        user.rol.toLowerCase().includes(searchUsers.toLowerCase())
    ) : [];

    const filtrarClientesProximosPagos = (clientes: ClientType[]) => {
        return clientes.filter(cliente => {
            if (cliente.membresiaActual) {
                const diasParaPagar = calculateDaysUntilPayment(cliente.membresiaActual.fechaFin);
                return diasParaPagar <= 10 && diasParaPagar > 0;
            }
            return false;
        });
    };
    useEffect(() => {
        const clientesFiltrados = filtrarClientesProximosPagos(clientesConMembresia);
        setClientesProximosPagos(clientesFiltrados);
    }, [clientesConMembresia]);

    useEffect(() => {
        console.log('Clientes con membresía actual:', clientesConMembresia);
        const contarMembresiasHoy = () => {
            const hoy = dayjs().startOf('day');

            let contador = 0;

            clientesConMembresia.forEach(client => {
                if (client.membresias && Array.isArray(client.membresias)) {
                    client.membresias.forEach(membresia => {
                        const fechaInicio = dayjs(membresia.fechaInicio).startOf('day');
                        if (fechaInicio.isSame(hoy, 'day')) {
                            console.log(`Cliente: ${client.nombre}, Fecha Inicio: ${fechaInicio.format('YYYY-MM-DD')}`);
                            contador += 1;
                        }
                    });
                }
            });

            console.log(`Membresías asignadas hoy: ${contador}`);
            setMembresiasHoy(contador);
        };

        contarMembresiasHoy();
    }, [clientesConMembresia]);

    const totalClientes = userRoles.filter((user: User) => user.rol === 'CLIENTE').length;
    // Calcular ingresos mensuales: 2000 pesos por cada cliente con membresía activa
    const ingresosMensuales = clientesConMembresia.reduce((sum, client) => {
        const membresia = client.membresiaActual;
        if (!membresia) return sum;

        const inicio = new Date(membresia.fechaInicio);
        const hoy = new Date();
        const mismoMes = inicio.getMonth() === hoy.getMonth();
        const mismoAnio = inicio.getFullYear() === hoy.getFullYear();

        if (membresia.tipo === 'MENSUAL') {
            return sum + 2000;
        } else if (membresia.tipo === 'TRIMESTRAL') {
            if (mismoMes && mismoAnio) {
                return sum + 10000;
            }
        } else if (membresia.tipo === 'ANUAL') {
            if (mismoMes && mismoAnio) {
                return sum + 20000;
            }
        }
        return sum;
    }, 0);

    // Actualizar ingresos anteriores
    useEffect(() => {
        setPreviousIngresosMensuales(ingresosMensuales);
        setPreviousTotalClientes(totalClientes);
    }, [ingresosMensuales, totalClientes]);

    // Calcular porcentajes
    const ingresosPorcentaje = previousIngresosMensuales ? ((ingresosMensuales - previousIngresosMensuales) / previousIngresosMensuales) * 100 : 0;
    const clientesPorcentaje = previousTotalClientes ? ((totalClientes - previousTotalClientes) / previousTotalClientes) * 100 : 0;

    const calculateDaysUntilPayment = (fechaFin: string): number => {
        const today = new Date();
        const fin = new Date(fechaFin);
        const diffTime = fin.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

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
                console.log('Historiales obtenidos:', data); // Verifica los datos aquí
                setHistoriales(data);
            } catch (error) {
                console.error('Error al obtener los historiales:', error);
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

    const handleConvertToClient = async (id: string) => {
        try {
            console.log('handleConvertToClient - Iniciando con ID:', id);
            const response = await fetch(`/api/newClients`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('handleConvertToClient - Error en la respuesta:', errorData);
                throw new Error(errorData.error || 'Error desconocido al convertir el cliente');
            }

            const updatedUser = await response.json();
            console.log('handleConvertToClient - Usuario actualizado:', updatedUser);
            setClientesEspera(prevClientes =>
                prevClientes.filter((c: { id: number }) => c.id !== updatedUser.id)
            );
            toast.success('Cliente convertido con éxito');
            fetchUserRoles(); // Asegurar que se actualicen los roles
        } catch (error: any) {
            console.error('Error al convertir el cliente:', error);
            toast.error(`Error al convertir el cliente: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchUserRoles();
    }, []);

    const fetchUserRoles = async () => {
        try {
            const response = await fetch("/api/admin/roles");
            if (!response.ok) {
                throw new Error('Error al obtener los roles de usuario');
            }
            const data = await response.json();
            console.log('Roles obtenidos:', data); // Añade este log para verificar los datos
            setUserRoles(data);
        } catch (error) {
            console.error('Error al obtener los roles de usuario:', error);
            toast.error('Error al cargar los roles de usuario');
        }
    };

    useEffect(() => {
        console.log('Estado actualizado de userRoles:', userRoles);
    }, [userRoles]);

    const handleUpdateRole = async (id: string, newRole: string) => {
        try {
            const response = await fetch(`/api/admin/roles`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, rol: newRole }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al actualizar el rol');
            }

            const updatedUser = await response.json();
            toast.success('Rol actualizado con éxito');
            fetchUserRoles(); // Refresca la lista de roles
        } catch (error) {
            console.error('Error al actualizar el rol del usuario:', error);
            toast.error(`Error al actualizar el rol: ${(error as Error).message}`);
        }
    };

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
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
        if (tab === 'roles') {
            fetchUserRoles(); // Ahora puedes llamar a fetchUserRoles aquí
        }
    };


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

    // Función para calcular la asistencia mensual
    const calcularAsistenciaMensual = () => {
        const asistenciaMensual: number[] = Array(12).fill(0);
        const clientesPorMes: Set<number>[] = Array.from({ length: 12 }, () => new Set());

        bookings.forEach(booking => {
            const fecha = new Date(booking.fecha);
            const mes = fecha.getMonth(); // 0 = Enero, 1 = Febrero, ..., 11 = Diciembre
            clientesPorMes[mes].add(booking.cliente.id); // Usar cliente.id
        });

        clientesPorMes.forEach((clientesSet, mes) => {
            asistenciaMensual[mes] = clientesSet.size;
        });

        return asistenciaMensual;
    };

    const asistenciaMensual = calcularAsistenciaMensual();

    const barChartData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
            {
                label: 'Asistencia Mensual',
                data: asistenciaMensual,
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
                text: 'Asistencia Mensual',
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
        labels: ['Mensual', 'Semestral', 'Anual'],
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

    // Calcular el índice de los elementos a mostrar
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistorial = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

    // Calcular el total de páginas
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handlePageSelect = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchHistory, sortBy]);

    const handleMembershipChange = async (clientId: number, newMembershipType: string, isAdvanced: boolean) => {
        console.log('handleMembershipChange called');
        console.log('clientId:', clientId);
        console.log('newMembershipType:', newMembershipType);
        console.log('isAdvanced:', isAdvanced);

        if (!newMembershipType) {
            toast.error('Por favor, seleccione un tipo de membresía válido');
            return;
        }

        let payload: any = {
            clientId,
            tipo: newMembershipType.toUpperCase(),
        };

        if (isAdvanced) {
            payload.descripcion = 'Pago adelantado';
            console.log('Payload para pago adelantado:', payload);
        } else {
            let duration = 0;
            switch (newMembershipType) {
                case 'MENSUAL':
                    duration = 30;
                    break;
                case 'TRIMESTRAL':
                    duration = 180; // Actualizado a 90 días
                    break;
                case 'ANUAL':
                    duration = 365;
                    break;
                default:
                    duration = 30;
            }

            const fechaInicio = new Date();
            const fechaFin = new Date(fechaInicio.getTime() + (duration * 24 * 60 * 60 * 1000));

            payload.fechaInicio = fechaInicio.toISOString();
            payload.fechaFin = fechaFin.toISOString();
            console.log('Payload para pago normal:', payload);
        }

        try {
            const response = await fetch('/api/admin/updateMembership', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('Respuesta de la API:', response);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error de la API:', errorData);
                throw new Error(errorData.error || 'Error desconocido al actualizar la membresía');
            }

            const updatedClient: ClientType = await response.json();
            console.log('Cliente actualizado:', updatedClient);

            setClientesConMembresia(prev =>
                prev.map((client: ClientType) =>
                    client.id === updatedClient.id ? updatedClient : client
                )
            );
            toast.success('Membresía actualizada con éxito');

            // Resetear la selección después de la asignación
            setSelectedMembership(prev => ({
                ...prev,
                [clientId]: { tipo: '', isAdvanced: false }
            }));
        } catch (error) {
            console.error('Error al actualizar la membresía:', error);
            toast.error(`Error al actualizar la membresía: ${(error as Error).message}`);
        }
    }

    const handleDeleteM = (id: number, type: string) => {
        setDeleteConfirmation({ isOpen: true, id, type });
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
                        {/*   <li>
                            <button onClick={() => handleTabChange('history')} className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'history' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                                <History className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                <span className="ml-3">Historial</span>
                            </button>
                        </li> */}
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
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-2">Clientes con membresías pagadas hoy</h3>
                            <p className="text-4xl font-bold text-[#2272FF]">{membresiasHoy} clientes</p>
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
                                    <div className="flex items-center mb-4">
                                        <ProfileImage src={client.foto} alt={client.nombre} />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold">{client.nombre}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">ID: {client.id}</p>
                                        </div>
                                    </div>
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

                {/* Gestión de Membresías */}
                {activeTab === 'memberships' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Gestionar Membresías</h2>

                        {/* Controles de búsqueda y ordenación */}
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
                                    <SelectItem value="nombre">Nombre</SelectItem>
                                    <SelectItem value="membresia">Tipo de Membresía</SelectItem>
                                    <SelectItem value="id">ID de Cliente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Carrusel de clientes próximos a pagar */}
                        {clientesProximosPagos.length > 0 && (
                            <div className="mb-8 w-full">
                                <h3 className="text-xl font-semibold mb-4">Clientes Próximos a Pagar:</h3>
                                <Carousel className="w-full">
                                    <CarouselContent className="flex space-x-2">
                                        {clientesProximosPagos.map((client) => (
                                            <CarouselItem key={client.id} className="flex-shrink-0 w-48">
                                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                                                    <div className="flex items-center mb-3">
                                                        <ProfileImage src={client.foto || '/default-profile.png'} alt={client.nombre} />
                                                        <div className="ml-3">
                                                            <h3 className="text-md font-semibold">{client.nombre}</h3>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">ID: {client.id}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        Próximo Pago: {formatDate(client.membresiaActual?.fechaFin || '')}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        Días para Pagar: {calculateDaysUntilPayment(client.membresiaActual?.fechaFin || '')}
                                                    </p>
                                                    <a
                                                        href={`https://wa.me/${client.telefono}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200"
                                                    >
                                                        <MessageCircle size={20} />
                                                    </a>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMemberships.map((client) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <div className="flex items-center mb-4">
                                        <ProfileImage src={client.foto || '/default-profile.png'} alt={client.nombre} />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold">{client.nombre}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">ID: {client.id}</p>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor={`membership-${client.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo de Membresía
                                        </label>
                                        <select
                                            id={`membership-${client.id}`}
                                            value={selectedMembership[client.id]?.tipo || ''}
                                            onChange={(e) => {
                                                const tipo = e.target.value;
                                                const isAdvanced = selectedMembership[client.id]?.isAdvanced || false;
                                                handleMembershipChange(client.id, tipo, isAdvanced);
                                                // Resetear la selección después de la asignación
                                                setSelectedMembership(prev => ({
                                                    ...prev,
                                                    [client.id]: { tipo: '', isAdvanced: false }
                                                }));
                                            }}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#2272FF] focus:border-[#2272FF] dark:text-white"
                                        >
                                            <option value="" disabled>
                                                Seleccione la membresía
                                            </option>
                                            <option value="MENSUAL">Mensual</option>
                                            <option value="TRIMESTRAL">Semestral</option>
                                            <option value="ANUAL">Anual</option>
                                        </select>

                                        {/* Añadir un checkbox para indicar si es adelantado */}
                                        <label className="flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembership[client.id]?.isAdvanced || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setSelectedMembership(prev => ({
                                                        ...prev,
                                                        [client.id]: {
                                                            ...prev[client.id],
                                                            isAdvanced: isChecked,
                                                        },
                                                    }));
                                                }}
                                                className="mr-2"
                                            />
                                            Adelantar Pago
                                        </label>
                                    </div>
                                    {client.membresiaActual ? (
                                        <>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Último Pago: {formatDate(client.membresiaActual.fechaInicio)}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Próximo Pago: {formatDate(client.membresiaActual.fechaFin)}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Días para Pagar: {calculateDaysUntilPayment(client.membresiaActual.fechaFin)}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                Estado de Pago: {client.membresiaActual.estadoPago}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                            No se le ha asignado ninguna membresía
                                        </p>
                                    )}
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
                                    <div className="flex items-center mb-4">
                                        <ProfileImage src={booking.cliente.foto} alt={booking.cliente.nombre} />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold">{booking.cliente.nombre}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Fecha: {new Date(booking.fecha).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
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
                                    <div className="flex items-center mb-4">
                                        <ProfileImage src={client.foto} alt={client.nombre} />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold">{client.nombre}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Usuario: {client.username}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carnet: {client.carnetIdentidad}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Teléfono: {client.telefono}</p>
                                    <Button className="w-full" onClick={async () => {
                                        await handleConvertToClient(client.id);
                                    }}>
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
                            {sortItems(filteredUsers).map((user) => (
                                <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <div className="flex items-center mb-4">
                                        <ProfileImage src={user.foto} alt={user.nombre} />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold">{user.nombre}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Rol actual: {user.rol}</p>
                                        </div>
                                    </div>
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
                                                setUserRoles(prevUsers =>
                                                    prevUsers.map(u =>
                                                        u.id === updatedUser.id ? { ...u, rol: updatedUser.rol } : u
                                                    )
                                                );
                                                toast.success('Rol actualizado con éxito');
                                            } catch (error) {
                                                console.error('Error detallado al actualizar el rol:', error);
                                                await fetchUserRoles();
                                                toast.error(`Error al actualizar el rol: ${(error as Error).message}`);
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
                                <Input type="text" placeholder="Buscar en historial..." className="w-full sm:w-64 pl-10 pr-4" />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <Select onValueChange={(value) => setSortBy(value)}>
                                <SelectTrigger className="w-full sm:w-auto">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Fecha</SelectItem>
                                    <SelectItem value="action">Acción</SelectItem>
                                    <SelectItem value="user">Usuario</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.isArray(filteredHistory) && filteredHistory.map((item: { id: string; accion: string; descripcion: string; usuario: { nombre: string }; entrenador?: { usuario: { nombre: string } }; membresia?: { tipo: string }; reserva?: { fecha: string }; fecha: string }) => (
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
