"use client"
import { useState, useEffect } from 'react'
import { Dumbbell, Calendar, Sun, Moon, X, Menu, MessageSquare, DollarSign, Users, Clock, CreditCard, CheckCircle, ArrowUpDown, Phone, IdCard, Award } from 'lucide-react'
import Link from 'next/link'

export default function TrainerPage() {
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [activeTab, setActiveTab] = useState('clients')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [clients, setClients] = useState([
        { id: 1, name: 'Juan Pérez', clientId: 'GV001', phone: '+34 123 456 789', membershipType: 'Anual', lastPayment: '2023-04-15', nextPayment: '2023-05-15', daysUntilPayment: 7 },
        { id: 2, name: 'Ana López', clientId: 'GV002', phone: '+34 987 654 321', membershipType: 'Mensual', lastPayment: '2023-04-20', nextPayment: '2023-05-20', daysUntilPayment: 12 },
        { id: 3, name: 'Luis Martínez', clientId: 'GV003', phone: '+34 456 789 123', membershipType: 'Trimestral', lastPayment: '2023-03-01', nextPayment: '2023-06-01', daysUntilPayment: 24 },
    ])
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

    const handlePaymentUpdate = (clientId: number, paid: boolean) => {
        setClients(clients.map(client => {
            if (client.id === clientId) {
                const today = new Date()
                const nextPaymentDate = new Date(today.setMonth(today.getMonth() + (client.membershipType === 'Anual' ? 12 : client.membershipType === 'Trimestral' ? 3 : 1)))
                return {
                    ...client,
                    lastPayment: paid ? new Date().toISOString().split('T')[0] : client.lastPayment,
                    nextPayment: paid ? nextPaymentDate.toISOString().split('T')[0] : client.nextPayment,
                    daysUntilPayment: paid ? Math.ceil((nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : client.daysUntilPayment
                }
            }
            return client
        }))
    }

    const handleMembershipChange = (clientId: number, newMembershipType: string) => {
        setClients(clients.map(client => {
            if (client.id === clientId) {
                return {
                    ...client,
                    membershipType: newMembershipType
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
                return a.name.localeCompare(b.name)
            case 'membershipType':
                return a.membershipType.localeCompare(b.membershipType)
            case 'clientId':
                return a.clientId.localeCompare(b.clientId)
            default:
                return 0
        }
    })

    const sortedSchedules = [...schedules].sort((a, b) => {
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
                return a.name.localeCompare(b.name)
            case 'membershipType':
                return a.membershipType.localeCompare(b.membershipType)
            case 'nextPayment':
                return new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime()
            case 'daysUntilPayment':
                return a.daysUntilPayment - b.daysUntilPayment
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

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 ${isDarkMode ? 'dark' : ''} transition-colors duration-300`}>
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-[#2272FF] flex items-center transition-transform duration-300 hover:scale-105">
                        <Dumbbell className="mr-2" />
                        GYM-VICTORIA
                    </Link>
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
                        <button
                            onClick={() => handleTabChange('payments')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeTab === 'payments' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <DollarSign className="inline-block mr-1" size={16} />
                            Pagos
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
                    <button
                        onClick={() => handleTabChange('payments')}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeTab === 'payments' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <DollarSign className="inline-block mr-1" size={16} />
                        Pagos
                    </button>
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
                                    <h3 className="text-xl font-semibold mb-2">{client.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                        <IdCard className="inline-block mr-2" size={16} />
                                        ID: {client.clientId}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                        <Phone className="inline-block mr-2" size={16} />
                                        Teléfono: {client.phone}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                                        <Award className="inline-block mr-2" size={16} />
                                        Membresía: {client.membershipType}
                                    </p>
                                    <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center justify-center transform hover:scale-105">
                                        <MessageSquare size={18} className="mr-2" />
                                        Mensaje
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Schedule Management Section */}
                {activeTab === 'schedules' && (
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
                            {sortedSchedules.map((schedule, index) => (
                                <div key={schedule.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                                    <h3 className="text-lg font-semibold mb-2">{schedule.clientName}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                                        <Calendar className="inline-block mr-1" size={16} />
                                        {schedule.date}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                        <Clock className="inline-block mr-1" size={16} />
                                        {schedule.time}
                                    </p>
                                    <button className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 flex items-center justify-center transform hover:scale-105">
                                        <X size={18} className="mr-2" />
                                        Cancelar
                                    </button>
                                </div>
                            ))}
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
                                    <h3 className="text-xl font-semibold mb-2">{client.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">ID: {client.clientId}</p>
                                    <div className="mb-2">
                                        <label htmlFor={`membership-${client.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo de Membresía
                                        </label>
                                        <select
                                            id={`membership-${client.id}`}
                                            value={client.membershipType}
                                            onChange={(e) => handleMembershipChange(client.id, e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#2272FF] focus:border-[#2272FF] dark:text-white"
                                        >
                                            <option value="Mensual">Mensual</option>
                                            <option value="Trimestral">Trimestral</option>
                                            <option value="Anual">Anual</option>
                                        </select>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Último Pago: {client.lastPayment}</p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Próximo Pago: {client.nextPayment}</p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Días Restantes: {client.daysUntilPayment}</p>
                                    <button
                                        onClick={() => handlePaymentUpdate(client.id, true)}
                                        className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center justify-center transform hover:scale-105"
                                    >
                                        <CreditCard size={18} className="mr-2" />
                                        Registrar Pago
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