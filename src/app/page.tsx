"use client"
import { useState, useEffect } from 'react'
import { Dumbbell, Users, CreditCard, Calendar, BarChart, Sun, Moon, ChevronRight, Menu, X, Coffee, UserPlus, LogIn, Star, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Award } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 rounded-b-2xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#2272FF] flex items-center transition-transform duration-300 hover:scale-105">
            <Dumbbell className="mr-2" />
            GYM-VICTORIA
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link href="#services" className="text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300 flex items-center">
              <Users className="mr-1" size={18} />
              Servicios
            </Link>
            <Link href="#plans" className="text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300 flex items-center">
              <CreditCard className="mr-1" size={18} />
              Planes
            </Link>
            <Link href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300 flex items-center">
              <Star className="mr-1" size={18} />
              Testimonios
            </Link>
            <Link href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300 flex items-center">
              <Phone className="mr-1" size={18} />
              Contacto
            </Link>
          </nav>
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link href="/login/inicio">
              <button className="bg-[#2272FF] text-white px-4 py-2 rounded-full hover:bg-[#1b5acc] transition-colors duration-300 flex items-center">
                <LogIn className="mr-1" size={18} />
                Iniciar Sesión
              </button>
            </Link>
            <Link href="/login/registrarse">

              <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center">
                <UserPlus className="mr-1" size={18} />
                Registrarse
              </button>
            </Link>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 py-4 px-4 transition-all duration-300 rounded-b-2xl">
            <nav className="flex flex-col space-y-4">
              <Link href="#services" className="text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300 flex items-center">
                <Users className="mr-2" size={18} />
                Servicios
              </Link>
              <Link href="#plans" className="text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300 flex items-center">
                <CreditCard className="mr-2" size={18} />
                Planes
              </Link>
              <Link href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300 flex items-center">
                <Star className="mr-2" size={18} />
                Testimonios
              </Link>
              <Link href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300 flex items-center">
                <Phone className="mr-2" size={18} />
                Contacto
              </Link>
              <button
                onClick={toggleDarkMode}
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-[#2272FF] dark:hover:text-[#2272FF] transition-colors duration-300"
              >
                {isDarkMode ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
              <Link href="/login/inicio">
                <button className="flex items-center text-[#2272FF] hover:text-[#1b5acc] transition-colors duration-300">
                  <LogIn className="mr-2" size={18} />
                  Iniciar Sesión
                </button>
              </Link>
              <Link href="/login/registrarse">
                <button className="flex items-center text-green-500 hover:text-green-600 transition-colors duration-300">
                  <UserPlus className="mr-2" size={18} />
                  Registrarse
                </button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 bg-cover bg-center min-h-screen flex items-center relative rounded-b-3xl" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
        <div className="absolute inset-0 bg-black opacity-50 rounded-b-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fadeIn">GYM-VICTORIA</h1>
          <p className="text-xl md:text-2xl text-white mb-8 animate-fadeIn animation-delay-200">Entrena y Recarga</p>
          <Link href="/login/inicio">
            <button className="px-8 py-3 bg-[#2272FF] text-white rounded-full text-lg font-semibold hover:bg-[#1b5acc] transition-all duration-300 animate-fadeIn animation-delay-400 transform hover:scale-105 flex items-center mx-auto">
              <Dumbbell className="mr-2" size={24} />
              Empieza Ahora
            </button>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300 rounded-3xl my-8 mx-4">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Dumbbell, title: "Entrenamiento", description: "Equipos de última generación" },
              { icon: UserPlus, title: "Personal", description: "Entrenadores expertos" },
              { icon: Coffee, title: "Café", description: "Bebidas energizantes" }
            ].map((service, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: `${index * 200}ms` }}>
                <service.icon className="w-12 h-12 text-[#2272FF] mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section id="plans" className="py-16 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 rounded-3xl my-8 mx-4">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">Planes de Membresía</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Básico', price: 2000, icon: Users, features: ['Acceso a equipos', '2 clases grupales/semana', 'Casillero estándar'] },
              { name: 'Premium', price: 3000, icon: Star, features: ['Acceso total 24/7', 'Clases ilimitadas', 'Casillero premium', '1 sesión PT/mes'] },
              { name: 'Elite', price: 4000, icon: Award, features: ['Todo lo de Premium', '3 sesiones PT/mes', 'Acceso a spa', 'Nutricionista'] }
            ].map((plan, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: `${index * 200}ms` }}>
                <plan.icon className="w-12 h-12 text-[#2272FF] mb-4 mx-auto" />
                <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100 text-center">{plan.name}</h3>
                <p className="text-3xl font-bold text-[#2272FF] mb-4 text-center">${plan.price}/mes</p>
                <ul className="mb-6 text-gray-600 dark:text-gray-300">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="mb-2 flex items-center">
                      <ChevronRight className="mr-2 text-[#2272FF]" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login/inicio">
                  <button className="w-full bg-[#2272FF] text-white px-4 py-2 rounded-full hover:bg-[#1b5acc] transition-colors duration-300">
                    Seleccionar Plan
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300 rounded-3xl my-8 mx-4">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">Testimonios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "María G.", comment: "GYM-VICTORIA cambió mi vida." },
              { name: "Carlos R.", comment: "Concepto de gimnasio y café perfecto." },
              { name: "Laura S.", comment: "Planes personalizados excelentes." }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl animate-fadeIn" style={{ animationDelay: `${index * 200}ms` }}>
                <Star className="w-8 h-8 text-yellow-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">&ldquo;{testimonial.comment}&rdquo;</p>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-8 transition-colors duration-300 rounded-t-3xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Phone className="mr-2" size={20} />
                Contacto
              </h3>
              <p className="flex items-center mb-2">
                <MapPin className="mr-2" size={16} />
                Avenida 5ta entre calle 84 y 86 (bajos del banco), La Habana, Cuba.
              </p>
              <p className="flex items-center mb-2">
                <Phone className="mr-2" size={16} />
                (+53) 5 283-3021
              </p>
              <p className="flex items-center">
                <Mail className="mr-2" size={16} />
                jairapi@yahoo.com
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Enlaces Rápidos</h3>
              <ul>
                <li className="mb-2">
                  <Link href="#services" className="hover:text-[#2272FF] transition-colors duration-300 flex items-center">
                    <ChevronRight className="mr-1" size={16} />
                    Servicios
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="#plans" className="hover:text-[#2272FF] transition-colors duration-300 flex items-center">
                    <ChevronRight className="mr-1" size={16} />
                    Planes
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="hover:text-[#2272FF] transition-colors duration-300 flex items-center">
                    <ChevronRight className="mr-1" size={16} />
                    Testimonios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/andres.gymvictoria" className="hover:text-[#2272FF] transition-colors duration-300">
                  <Facebook size={24} />
                </a>
                <a href="https://www.instagram.com/gymvictoria2/" className="hover:text-[#2272FF] transition-colors duration-300">
                  <Instagram size={24} />
                </a>
                {/* <a href="#" className="hover:text-[#2272FF] transition-colors duration-300">
                  <Twitter size={24} />
                </a> */}
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; {new Date().getFullYear()} GYM-VICTORIA. Todos los derechos reservados. Designed by <a href="https://www.instagram.com/dasieloski" target="_blank" rel="noopener noreferrer">Dasieloski</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}