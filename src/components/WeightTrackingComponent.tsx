"use client";

import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import WeightForm from '@/components/WeightForm';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface WeightRecord {
    id: string;
    fecha: string;
    peso: number;
    altura: number;
    imc: number;
    grasaCorporal: number;
    cuello: number;
    pecho: number;
    brazo: number;
    cintura: number;
    cadera: number;
    muslo: number;
}

interface WeightTrackingComponentProps {
    clientId: string;
}

interface WeightRecordPartial {
    peso: number;
    altura: number;
    imc: number;
    grasaCorporal: number;
    cuello: number;
    pecho: number;
    brazo: number;
    cintura: number;
    cadera: number;
    muslo: number;
}

function calcularPesoIdeal(altura: number): number {
    const alturaEnCm = altura * 100; // Convertir metros a centímetros
    return alturaEnCm - 100;
}

// Función para la fórmula de Broca
function calcularBroca(alturaCm: number): number {
    return alturaCm - 100;
}

// Función para la fórmula de Lorentz
function calcularLorentz(alturaCm: number): number {
    return alturaCm - 100 - ((alturaCm - 150) / 4);
}

// Función para la fórmula de Devine
function calcularDevine(alturaCm: number): number {
    const alturaInches = alturaCm / 2.54;
    const alturaSobre5Pies = alturaInches - 60; // 5 pies = 60 pulgadas
    return 50 + 2.3 * alturaSobre5Pies;
}

// Función para la fórmula de Hamwi
function calcularHamwi(alturaCm: number): number {
    return 48.0 + 2.7 * ((alturaCm / 2.54) - 60);
}

// Función para la fórmula de Robinson
function calcularRobinson(alturaCm: number): number {
    return 52 + 1.9 * ((alturaCm / 2.54) - 60);
}

// Función para la fórmula de Miller
function calcularMiller(alturaCm: number): number {
    return 56.2 + 1.41 * ((alturaCm / 2.54) - 60);
}

// Función para la fórmula de Peck
function calcularPeck(alturaCm: number): number {
    return 49.0 + 1.7 * ((alturaCm / 2.54) - 60);
}

// Función para calcular el peso ideal promedio
function calcularPesoIdealPromedio(alturaCm: number): number {
    const broca = calcularBroca(alturaCm);
    const lorentz = calcularLorentz(alturaCm);
    const devine = calcularDevine(alturaCm);
    const hamwi = calcularHamwi(alturaCm);
    const robinson = calcularRobinson(alturaCm);
    const miller = calcularMiller(alturaCm);
    const peck = calcularPeck(alturaCm);

    const suma = broca + lorentz + devine + hamwi + robinson + miller + peck;
    return suma / 7;
}

// Agregar esta función en algún lugar del archivo, preferiblemente después de las funciones de cálculo de peso ideal

function obtenerNivelRiesgoICC(icc: number): { nivel: string; color: string } {
    if (icc <= 0.90) {
        return { nivel: 'Bajo Riesgo', color: 'green' };
    } else if (icc >= 0.91 && icc <= 0.99) {
        return { nivel: 'Riesgo Moderado', color: 'yellow' };
    } else {
        return { nivel: 'Alto Riesgo', color: 'red' };
    }
}

export default function WeightTrackingComponent({ clientId }: WeightTrackingComponentProps) {
    const [activeTab, setActiveTab] = useState('peso');
    const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
    const [showWeightForm, setShowWeightForm] = useState(false);
    const [selectedWeightRecord, setSelectedWeightRecord] = useState<WeightRecord | null>(null);


    useEffect(() => {
        fetchWeightRecords();
    }, [clientId]);

    const fetchWeightRecords = async () => {
        try {
            const response = await fetch(`/api/cliente/${clientId}/registro-peso`);
            if (!response.ok) {
                throw new Error('Error al obtener los registros de peso');
            }
            const data = await response.json();
            setWeightRecords(data);
        } catch (error) {
            console.error('Error al obtener los registros de peso:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const renderMonitorTab = () => {
        const latestRecords = weightRecords.slice(-5).reverse();

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Monitoreo de Progreso</h2>

                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Últimos Registros</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {latestRecords.map((record) => (
                            <div key={record.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                                <p className="font-semibold text-lg mb-2">{formatDate(record.fecha)}</p>
                                <p>Peso: <span className="font-medium">{record.peso.toFixed(1)} kg</span></p>
                                <p>IMC: <span className="font-medium">{record.imc.toFixed(2)}</span></p>
                                <p>Grasa Corporal: <span className="font-medium">{record.grasaCorporal.toFixed(1)}%</span></p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4">Gráfico de Progreso</h3>
                    <div className="h-96">
                        <Line
                            data={{
                                labels: weightRecords.map(record => formatDate(record.fecha)),
                                datasets: [
                                    {
                                        label: 'Peso (kg)',
                                        data: weightRecords.map(record => record.peso),
                                        borderColor: 'rgb(75, 192, 192)',
                                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                        tension: 0.1
                                    },
                                    {
                                        label: 'IMC',
                                        data: weightRecords.map(record => record.imc),
                                        borderColor: 'rgb(255, 99, 132)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                        tension: 0.1
                                    },
                                    {
                                        label: 'Grasa Corporal (%)',
                                        data: weightRecords.map(record => record.grasaCorporal),
                                        borderColor: 'rgb(153, 102, 255)',
                                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                                        tension: 0.1
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top' as const,
                                    },
                                    title: {
                                        display: true,
                                        text: 'Progreso de Peso, IMC y Grasa Corporal'
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderHealthMetrics = () => {

        // Utiliza el registro de peso más reciente para los cálculos
        const latestRecord = weightRecords[weightRecords.length - 1];
        if (!latestRecord) return null;

        if (weightRecords.length === 0) return null;

        // Ordenar los registros por fecha
        const sortedRecords = [...weightRecords].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        const primerRegistro = sortedRecords[0];
        const ultimoRegistro = sortedRecords[sortedRecords.length - 1];

        const kgDiferencia = ultimoRegistro.peso - primerRegistro.peso;
        const diasDiferencia = Math.ceil((new Date(ultimoRegistro.fecha).getTime() - new Date(primerRegistro.fecha).getTime()) / (1000 * 60 * 60 * 24));

        const kgPorDia = diasDiferencia !== 0 ? kgDiferencia / diasDiferencia : kgDiferencia;
        const kgPorSemana = kgPorDia * 7;
        const kgPorMes = kgPorDia * 30;

        const pesos = weightRecords.map(record => record.peso);
        const pesoMaximo = Math.max(...pesos);
        const pesoMinimo = Math.min(...pesos);

        const ganancias = sortedRecords.reduce((acc, record, index) => {
            if (index === 0) return acc;
            const diff = record.peso - sortedRecords[index - 1].peso;
            return diff > 0 ? acc + diff : acc;
        }, 0);

        const idealWeight = calcularPesoIdeal(latestRecord.altura); // Calcular el peso ideal basado en la altura
        const waistHipRatio = latestRecord.cintura > 0 && latestRecord.cadera > 0
            ? latestRecord.cintura / latestRecord.cadera
            : 0;

        const perdidas = sortedRecords.reduce((acc, record, index) => {
            if (index === 0) return acc;
            const diff = record.peso - sortedRecords[index - 1].peso;
            return diff < 0 ? acc + Math.abs(diff) : acc;
        }, 0);

        const { nivel, color } = obtenerNivelRiesgoICC(waistHipRatio);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tarjetas Existentes */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Peso Ideal</h3>
                    <p className="text-3xl font-bold text-[#2272FF]">{idealWeight.toFixed(1)} kg</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Promedio de varias fórmulas de peso ideal
                    </p>
                    <div className="mt-4">
                        <h4 className="font-semibold">Fórmulas:</h4>
                        <ul className="text-sm">
                            <li>Broca: {calcularBroca(latestRecord.altura).toFixed(1)} kg</li>
                            <li>Lorentz: {calcularLorentz(latestRecord.altura).toFixed(1)} kg</li>
                            <li>Devine: {calcularDevine(latestRecord.altura).toFixed(1)} kg</li>
                            <li>Hamwi: {calcularHamwi(latestRecord.altura).toFixed(1)} kg</li>
                            <li>Robinson: {calcularRobinson(latestRecord.altura).toFixed(1)} kg</li>
                            <li>Miller: {calcularMiller(latestRecord.altura).toFixed(1)} kg</li>
                            <li>Peck: {calcularPeck(latestRecord.altura).toFixed(1)} kg</li>
                        </ul>
                    </div>
                    <p className="text-sm mt-2">
                        IMC normal: entre 18.5 y 24.9
                    </p>
                </div>

                {/* Índice Cintura-Cadera */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Índice Cintura-Cadera</h3>
                    <p className="text-3xl font-bold text-[#2272FF]">
                        {waistHipRatio > 0 ? waistHipRatio.toFixed(2) : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Relación entre la circunferencia de la cintura y la cadera
                    </p>

                    {/* Alerta de Nivel de Riesgo */}
                    {waistHipRatio > 0 && (
                        <div
                            className={`mt-4 p-3 rounded-md ${color === 'green'
                                    ? 'bg-green-100 text-green-800'
                                    : color === 'yellow'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                        >
                            <span className="font-semibold">Nivel de Riesgo: </span>{nivel}
                        </div>
                    )}

                    <div className="mt-4">
                        <h4 className="font-semibold">Categorías:</h4>
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Mujer</th>
                                    <th>Hombre</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Bajo</td>
                                    <td>≤ 0.71</td>
                                    <td>≤ 0.83</td>
                                </tr>
                                <tr>
                                    <td>Moderado</td>
                                    <td>0.71-0.77</td>
                                    <td>0.83-0.88</td>
                                </tr>
                                <tr>
                                    <td>Alto</td>
                                    <td>0.78-0.82</td>
                                    <td>0.89-0.94</td>
                                </tr>
                                <tr>
                                    <td>Muy Alto</td>
                                    <td>&gt; 0.82</td>
                                    <td>&gt; 0.94</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* IMC */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">IMC</h3>
                    <p className="text-3xl font-bold text-[#2272FF]">{latestRecord.imc.toFixed(1)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Índice de Masa Corporal
                    </p>
                    <div className="mt-4">
                        <h4 className="font-semibold">Categorías:</h4>
                        <ul className="text-sm">
                            <li>Delgadez: 15.0 a 16.0</li>
                            <li>Insuficiente: 16.0 a 18.5</li>
                            <li>Peso normal: 18.5 a 25</li>
                            <li>Sobrepeso: 25 a 30</li>
                            <li>Sobrepeso I - Obesidad Moderada: 30 a 35</li>
                            <li>Sobrepeso II - Obesidad severa: 35 a 40</li>
                            <li>Sobrepeso III - Obesidad mórbida: &gt; 40</li>
                        </ul>
                    </div>
                </div>

                {/* Índice de Grasa Corporal */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Índice de Grasa Corporal</h3>
                    <p className="text-3xl font-bold text-[#2272FF]">{latestRecord.grasaCorporal.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Medida del nivel de condición física
                    </p>
                    <div className="mt-4">
                        <h4 className="font-semibold">Categorías:</h4>
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Mujer</th>
                                    <th>Hombre</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Grasas esenciales</td>
                                    <td>10-13%</td>
                                    <td>2-5%</td>
                                </tr>
                                <tr>
                                    <td>Atleta</td>
                                    <td>14-20%</td>
                                    <td>6-13%</td>
                                </tr>
                                <tr>
                                    <td>Fitness</td>
                                    <td>21-24%</td>
                                    <td>14-17%</td>
                                </tr>
                                <tr>
                                    <td>Normal</td>
                                    <td>25-31%</td>
                                    <td>18-24%</td>
                                </tr>
                                <tr>
                                    <td>Obeso</td>
                                    <td>32%+</td>
                                    <td>25%+</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Nuevas Estadísticas Agregadas */}

                {/* Primer Uso */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Primer Uso</h3>
                    <p className="text-xl font-bold text-[#2272FF]">{formatDate(primerRegistro.fecha)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Peso: {primerRegistro.peso.toFixed(1)} kg</p>
                </div>

                {/* Último Uso */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Último Uso</h3>
                    <p className="text-xl font-bold text-[#2272FF]">{formatDate(ultimoRegistro.fecha)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Peso: {ultimoRegistro.peso.toFixed(1)} kg</p>
                </div>

                {/* Kg Ganados/Perdidos */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Kg Ganados/Perdidos</h3>
                    <p className={`text-2xl font-bold ${kgDiferencia >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {kgDiferencia >= 0 ? 'Ganados' : 'Perdidos'}: {kgDiferencia.toFixed(1)} kg
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">En {diasDiferencia} días</p>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Por Día: {kgPorDia.toFixed(2)} kg/día</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Por Semana: {kgPorSemana.toFixed(2)} kg/semana</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Por Mes: {kgPorMes.toFixed(2)} kg/mes</p>
                    </div>
                </div>

                {/* Peso Más Elevado */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Peso Más Elevado</h3>
                    <p className="text-xl font-bold text-[#2272FF]">{pesoMaximo.toFixed(1)} kg</p>
                </div>

                {/* Peso Más Bajo */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Peso Más Bajo</h3>
                    <p className="text-xl font-bold text-[#2272FF]">{pesoMinimo.toFixed(1)} kg</p>
                </div>

                {/* Ganancia Acumulada */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Ganancia Acumulada</h3>
                    <p className="text-xl font-bold text-green-500">{ganancias.toFixed(1)} kg</p>
                </div>

                {/* Pérdida Acumulada */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Pérdida Acumulada</h3>
                    <p className="text-xl font-bold text-red-500">{perdidas.toFixed(1)} kg</p>
                </div>
            </div>
        );
    };

    const addWeightRecord = async (data: WeightRecordPartial): Promise<void> => {
        try {
            const response = await fetch(`/api/cliente/${clientId}/registro-peso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Respuesta de error de la API:', errorData);
                throw new Error('Error al agregar el registro de peso');
            }

            const nuevoRegistro: WeightRecord = await response.json();
            setWeightRecords([...weightRecords, nuevoRegistro]);
            setShowWeightForm(false);
        } catch (error) {
            console.error('Error al agregar el registro de peso:', error);
            alert('Error al agregar el registro de peso. Por favor, intenta de nuevo.');
        }
    };

    return (
        <div>
            <div className="mb-4 flex space-x-4">
                <button
                    onClick={() => setActiveTab('peso')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'peso' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    Peso
                </button>
                <button
                    onClick={() => setActiveTab('monitorear')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'monitorear' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    Monitorear
                </button>
                <button
                    onClick={() => setActiveTab('estadisticas')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'estadisticas' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    Estadísticas
                </button>
            </div>

            {activeTab === 'peso' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Registro de Peso</h2>
                        <button
                            onClick={() => setShowWeightForm(true)}
                            className="flex items-center bg-[#2272FF] text-white px-4 py-2 rounded-md hover:bg-[#1b5acc] transition-colors duration-200"
                        >
                            <Plus size={20} className="mr-2" />
                            Agregar Registro
                        </button>
                    </div>
                    {showWeightForm && (
                        <WeightForm onSubmit={addWeightRecord} onCancel={() => setShowWeightForm(false)} />
                    )}
                    <div className="grid gap-4">
                        {weightRecords.map(registro => (
                            <div
                                key={registro.id}
                                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex justify-between items-center"
                                onClick={() => setSelectedWeightRecord(registro)}
                            >
                                <div>
                                    <p className="font-semibold">{formatDate(registro.fecha)}</p>
                                    <p>Peso: {registro.peso.toFixed(1)} kg</p>
                                    <p>IMC: {registro.imc.toFixed(2)}</p>
                                    <p>Grasa Corporal: {registro.grasaCorporal.toFixed(1)}%</p>
                                </div>
                                <ChevronRight size={20} className="text-gray-400" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'monitorear' && renderMonitorTab()}

            {activeTab === 'estadisticas' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Estadísticas de Salud</h2>
                    {renderHealthMetrics()}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-2">Progreso de Medidas</h3>
                        <Line
                            data={{
                                labels: weightRecords.map(record => formatDate(record.fecha)),
                                datasets: [
                                    {
                                        label: 'Cuello (cm)',
                                        data: weightRecords.map(record => record.cuello),
                                        borderColor: 'rgb(255, 99, 132)',
                                        tension: 0.1
                                    },
                                    {
                                        label: 'Pecho (cm)',
                                        data: weightRecords.map(record => record.pecho),
                                        borderColor: 'rgb(54, 162, 235)',
                                        tension: 0.1
                                    },
                                    {
                                        label: 'Brazo (cm)',
                                        data: weightRecords.map(record => record.brazo),
                                        borderColor: 'rgb(255, 206, 86)',
                                        tension: 0.1
                                    },
                                    {
                                        label: 'Cintura (cm)',
                                        data: weightRecords.map(record => record.cintura),
                                        borderColor: 'rgb(75, 192, 192)',
                                        tension: 0.1
                                    },
                                    {
                                        label: 'Cadera (cm)',
                                        data: weightRecords.map(record => record.cadera),
                                        borderColor: 'rgb(153, 102, 255)',
                                        tension: 0.1
                                    },
                                    {
                                        label: 'Muslo (cm)',
                                        data: weightRecords.map(record => record.muslo),
                                        borderColor: 'rgb(255, 159, 64)',
                                        tension: 0.1
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top' as const,
                                    },
                                    title: {
                                        display: true,
                                        text: 'Progreso de Medidas Corporales'
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}