import cron from 'node-cron';
import { deleteOldReservations } from '@/app/api/cliente/cleanup'; // Ajusta la ruta según tu estructura
import { updateVisits } from '@/app/api/cliente/updateVisits'; // Importa la función para actualizar visitas

// Ejecutar la limpieza todos los días a las 12:00 AM
cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando limpieza de reservas antiguas a la medianoche...');
    await deleteOldReservations(); // Mantiene la limpieza de reservas

    console.log('Actualizando contadores de visitas a la medianoche...');
    await updateVisits(); // Llama a la función para actualizar visitas
});