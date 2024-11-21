"use client";

import { useState } from 'react';
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
import Image from 'next/image';
import { Client } from '@/app/entrenador/page'; // Asegúrate de exportar la interfaz Client desde page.tsx

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
}

interface StatsModalProps {
  client: Client;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ client, onClose }) => {
  const weightRecords: WeightRecord[] = client.weightRecords || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-90vh overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Estadísticas de {client.nombre}</h2>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Últimos Registros</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weightRecords.slice(-5).reverse().map((record) => (
              <div key={record.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                <p className="font-semibold text-lg mb-2">{new Date(record.fecha).toLocaleDateString()}</p>
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
                labels: weightRecords.map(record => new Date(record.fecha).toLocaleDateString()),
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
        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#2272FF] text-white px-4 py-2 rounded-md hover:bg-[#1b5acc] transition-colors duration-300"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default StatsModal;