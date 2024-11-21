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
  id: number;
  fecha: string;
  peso: number;
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

export default function WeightTrackingComponent({ clientId }: WeightTrackingComponentProps) {
  const [activeTab, setActiveTab] = useState('peso');
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [selectedWeightRecord, setSelectedWeightRecord] = useState<WeightRecord | null>(null);

  useEffect(() => {
    // Función para obtener los registros de peso del cliente
    const fetchWeightRecords = async () => {
      try {
        const response = await fetch(`/api/cliente/${clientId}/registro-peso`);
        if (!response.ok) {
          throw new Error('Error al obtener los registros de peso');
        }
        const data = await response.json();
        setWeightRecords(data.registrosPeso);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWeightRecords();
  }, [clientId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const renderHealthMetrics = () => {
    // Utiliza el registro de peso más reciente para los cálculos
    const latestRecord = weightRecords[weightRecords.length - 1];
    if (!latestRecord) return null;

    const idealWeight = 153.8; // Este valor debería calcularse basado en la altura y otros factores
    const waistHipRatio = latestRecord.cintura / latestRecord.cadera;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Peso Ideal</h3>
          <p className="text-3xl font-bold text-[#2272FF]">{idealWeight.toFixed(1)} lb</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Promedio de varias fórmulas de peso ideal
          </p>
          <div className="mt-4">
            <h4 className="font-semibold">Fórmulas:</h4>
            <ul className="text-sm">
              <li>Broca: 165.3 lb</li>
              <li>Lorentz: 151.6 lb</li>
              <li>Devine: 155.3 lb</li>
              <li>Hamwi: 158.8 lb</li>
              <li>Robinson: 151.9 lb</li>
              <li>Miller: 151.6 lb</li>
              <li>Peck: 149.3 lb</li>
            </ul>
          </div>
          <p className="text-sm mt-2">
            IMC normal: entre 124.9 y 168.8 lb
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Índice Cintura-Cadera</h3>
          <p className="text-3xl font-bold text-[#2272FF]">{waistHipRatio.toFixed(2)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Relación entre la circunferencia de la cintura y la cadera
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
                  <td> `&gt;` 0.82</td>
                  <td> `&gt;`0.94</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
              <li>Sobrepeso III - Obesidad mórbida: `&gt;` 40</li>
            </ul>
          </div>
        </div>

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
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setActiveTab('peso')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            activeTab === 'peso' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Peso
        </button>
        <button
          onClick={() => setActiveTab('monitorear')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            activeTab === 'monitorear' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Monitorear
        </button>
        <button
          onClick={() => setActiveTab('estadisticas')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            activeTab === 'estadisticas' ? 'bg-[#2272FF] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
            <WeightForm
              onSubmit={(data) => {
                // Función para agregar el registro de peso
                const nuevoRegistro: WeightRecord = {
                  id: weightRecords.length + 1,
                  fecha: new Date().toISOString(),
                  ...data,
                };
                setWeightRecords([...weightRecords, nuevoRegistro]);
                setShowWeightForm(false);
              }}
              onCancel={() => setShowWeightForm(false)}
              initialData={selectedWeightRecord || undefined}
            />
          )}
          <div className="grid gap-4">
            {weightRecords.map(registro => (
              <div
                key={registro.id}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex justify-between items-center"
                onClick={() => setSelectedWeightRecord(registro)}
              >
                <div>
                  <p className="font-semibold">{new Date(registro.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>Peso: {registro.peso} kg</p>
                  <p>IMC: {registro.imc.toFixed(2)}</p>
                  <p>Grasa Corporal: {registro.grasaCorporal}%</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

   {/*    {activeTab === 'monitorear' && (
        // ... (contenido existente para la pestaña 'monitorear')
      )} */}

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