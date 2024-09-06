"use client"
import { useState, useEffect } from 'react'
import { Dumbbell, Users, CreditCard, Calendar, BarChart, Sun, Moon, Edit, Trash, Plus, ChevronLeft, ChevronRight, Search, Menu, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AdminDashboard() {
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [clients, setClients] = useState([
        { id: 1, name: 'Juan Pérez', clientId: 'GV001', phone: '+34 123 456 789', attendance: '3/week', paymentStatus: 'Al día', trainer: 'María García' },
        { id: 2, name: 'Ana López', clientId: 'GV002', phone: '+34 987 654 321', attendance: '2/week', paymentStatus: 'Pendiente', trainer: 'Carlos Rodríguez' },
        { id: 3, name: 'Luis Martínez', clientId: 'GV003', phone: '+34 456 789 123', attendance: '4/week', paymentStatus: 'Al día', trainer: 'María García' },
    ])
    const [memberships, setMemberships] = useState([
        { id: 1, clientName: 'Juan Pérez', type: 'Anual', startDate: '01/01/2023', endDate: '31/12/2023', status: 'Activo' },
        { id: 2, clientName: 'Ana López', type: 'Mensual', startDate: '01/05/2023', endDate: '31/05/2023', status: 'Activo' },
        { id: 3, clientName: 'Luis Martínez', type: 'Trimestral', startDate: '01/04/2023', endDate: '30/06/2023', status: 'Activo' },
    ])
    const [bookings, setBookings] = useState([
        { id: 1, clientName: 'Juan Pérez', date: '2023-05-15', time: '10:00', trainer: 'María García' },
        { id: 2, clientName: 'Ana López', date: '2023-05-16', time: '15:00', trainer: 'Carlos Rodríguez' },
        { id: 3, clientName: 'Luis Martínez', date: '2023-05-17', time: '18:00', trainer: 'María García' },
    ])
    const [newClients, setNewClients] = useState([
        { id: 1, name: 'Pedro Sánchez', username: 'pedros', idCard: '12345678A', phone: '+34 111 222 333' },
        { id: 2, name: 'María Rodríguez', username: 'mariar', idCard: '87654321B', phone: '+34 444 555 666' },
        { id: 3, name: 'Carlos García', username: 'carlosg', idCard: '11223344C', phone: '+34 777 888 999' },
    ])
    const [sortBy, setSortBy] = useState('')

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

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setIsMobileMenuOpen(false)
    }

    const sortItems = (items) => {
        if (sortBy) {
            return [...items].sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return -1
                if (a[sortBy] > b[sortBy]) return 1
                return 0
            })
        }
        return items
    }

  const barChartData = {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [
            {
                label: 'Asistencia Diaria',
                data: [65, 59, 80, 81, 56, 55, 40],
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
                        weight: 'bold',
                    },
                    color: isDarkMode ? 'white' : 'black',
                },
            },
            title: {
                display: true,
                text: 'Asistencia Semanal',
                font: {
                    size: 18,
                    weight: 'bold',
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

    const pieChartData = {
        labels: ['Mensual', 'Trimestral', 'Anual'],
        datasets: [
            {
                data: [30, 50, 20],
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
                        weight: 'bold',
                    },
                    color: isDarkMode ? 'white' : 'black',
                },
            },
            title: {
                display: true,
                text: 'Distribución de Membresías',
                font: {
                    size: 18,
                    weight: 'bold',
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
                                <Pie data={pieChartData} options={pieChartOptions} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-2">Total Clientes</h3>
                            <p className="text-4xl font-bold text-[#2272FF]">250</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">+5% desde el mes pasado</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-2">Ingresos Mensuales</h3>
                            <p className="text-4xl font-bold text-[#2272FF]">€15,000</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">+8% desde el mes pasado</p>
                        </div>
                    </div>
                )}

                {/* Clients Management */}
                {activeTab === 'clients' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div className="relative w-full sm:w-auto">
                                <input type="text" placeholder="Buscar clientes..." className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2272FF]" />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <select
                                className="w-full sm:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                onChange={(e) => setSortBy(e.target.value)}
                                value={sortBy}
                            >
                                <option value="">Ordenar por</option>
                                <option value="name">Nombre</option>
                                <option value="clientId">ID</option>
                                <option value="paymentStatus">Estado de Pago</option>
                            </select>
                            <button className="w-full sm:w-auto bg-[#2272FF] text-white px-4 py-2 rounded-lg hover:bg-[#1b5acc] transition-colors duration-200 flex items-center justify-center">
                                <Plus className="mr-2" size={20} />
                                Añadir Cliente
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(clients).map((client) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{client.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID: {client.clientId}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Teléfono: {client.phone}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Asistencia: {client.attendance}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado de Pago: {client.paymentStatus}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Entrenador: {client.trainer}</p>
                                    <div className="flex justify-end">
                                        <button className="text-blue-500 hover:text-blue-700 mr-2">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700">
                                            <Trash size={18} />
                                        </button>
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
                                <input type="text" placeholder="Buscar membresías..." className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2272FF]" />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <select
                                className="w-full sm:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                onChange={(e) => setSortBy(e.target.value)}
                                value={sortBy}
                            >
                                <option value="">Ordenar por</option>
                                <option value="clientName">Nombre del Cliente</option>
                                <option value="type">Tipo de Membresía</option>
                                <option value="startDate">Fecha de Inicio</option>
                            </select>
                            <button className="w-full sm:w-auto bg-[#2272FF] text-white px-4 py-2 rounded-lg hover:bg-[#1b5acc] transition-colors duration-200 flex items-center justify-center">
                                <Plus className="mr-2" size={20} />
                                Nueva Membresía
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(memberships).map((membership) => (
                                <div key={membership.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{membership.clientName}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tipo: {membership.type}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inicio: {membership.startDate}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fin: {membership.endDate}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Estado: {membership.status}</p>
                                    <div className="flex justify-end">
                                        <button className="text-blue-500 hover:text-blue-700 mr-2">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700">
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bookings Management */}
                {activeTab === 'bookings' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div className="relative w-full sm:w-auto">
                                <input type="text" placeholder="Buscar reservas..." className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2272FF]" />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <select
                                className="w-full sm:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                onChange={(e) => setSortBy(e.target.value)}
                                value={sortBy}
                            >
                                <option value="">Ordenar por</option>
                                <option value="clientName">Nombre del Cliente</option>
                                <option value="date">Fecha</option>
                                <option value="trainer">Entrenador</option>
                            </select>
                            <button className="w-full sm:w-auto bg-[#2272FF] text-white px-4 py-2 rounded-lg hover:bg-[#1b5acc] transition-colors duration-200 flex items-center justify-center">
                                <Plus className="mr-2" size={20} />
                                Nueva Reserva
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(bookings).map((booking) => (
                                <div key={booking.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{booking.clientName}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fecha: {booking.date}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hora: {booking.time}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Entrenador: {booking.trainer}</p>
                                    <div className="flex justify-end">
                                        <button className="text-blue-500 hover:text-blue-700 mr-2">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700">
                                            <Trash size={18} />
                                        </button>
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
                                <input type="text" placeholder="Buscar nuevos clientes..." className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2272FF]" />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <select
                                className="w-full sm:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                onChange={(e) => setSortBy(e.target.value)}
                                value={sortBy}
                            >
                                <option value="">Ordenar por</option>
                                <option value="name">Nombre</option>
                                <option value="username">Nombre de Usuario</option>
                                <option value="idCard">Carnet de Identidad</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortItems(newClients).map((client) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">{client.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usuario: {client.username}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carnet: {client.idCard}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Teléfono: {client.phone}</p>
                                    <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200">
                                        Convertir en Cliente Oficial
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}