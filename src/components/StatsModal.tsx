   import React from 'react';
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
   import { Client } from '@/app/entrenador/page';

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

   interface Estadisticas {
     kgDiferencia: number;
     diasDiferencia: number;
     kgPorDia: number;
     kgPorSemana: number;
     kgPorMes: number;
     pesoMaximo: number;
     pesoMinimo: number;
     ganancias: number;
     registros: WeightRecord[];
   }

   interface StatsModalProps {
     client: Client & { estadisticas: Estadisticas };
     onClose: () => void;
   }

   const StatsModal: React.FC<StatsModalProps> = ({ client, onClose }) => {
     const { estadisticas } = client;
     const weightRecords: WeightRecord[] = estadisticas.registros || [];

     console.log('Registros de peso:', weightRecords);

     const formatDate = (dateString: string) => {
       const date = new Date(dateString);
       return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
     };

     return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-screen overflow-y-auto">
           <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Estadísticas de {client.nombre}</h2>

           <div className="mb-8">
             <h3 className="text-xl font-semibold mb-4">Resumen de Progreso</h3>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                 <p className="font-semibold text-lg mb-2">Diferencia de Peso</p>
                 <p className="font-medium">{estadisticas.kgDiferencia.toFixed(1)} kg</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                 <p className="font-semibold text-lg mb-2">Días de Progreso</p>
                 <p className="font-medium">{estadisticas.diasDiferencia} días</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                 <p className="font-semibold text-lg mb-2">Peso Por Día</p>
                 <p className="font-medium">{estadisticas.kgPorDia.toFixed(2)} kg/día</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                 <p className="font-semibold text-lg mb-2">Peso Por Semana</p>
                 <p className="font-medium">{estadisticas.kgPorSemana.toFixed(2)} kg/semana</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                 <p className="font-semibold text-lg mb-2">Peso Por Mes</p>
                 <p className="font-medium">{estadisticas.kgPorMes.toFixed(2)} kg/mes</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                 <p className="font-semibold text-lg mb-2">Peso Máximo</p>
                 <p className="font-medium">{estadisticas.pesoMaximo.toFixed(1)} kg</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                 <p className="font-semibold text-lg mb-2">Peso Mínimo</p>
                 <p className="font-medium">{estadisticas.pesoMinimo.toFixed(1)} kg</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                 <p className="font-semibold text-lg mb-2">Ganancias Totales</p>
                 <p className="font-medium">{estadisticas.ganancias.toFixed(1)} kg</p>
               </div>
             </div>
           </div>

           <div className="mb-8">
             <h3 className="text-xl font-semibold mb-4">Últimos Registros</h3>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {weightRecords.slice(-5).reverse().map((record) => (
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