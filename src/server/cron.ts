import cron from 'node-cron';
import { deleteOldReservations } from '@/app/api/cliente/cleanup';
import { updateVisits } from '@/app/api/cliente/updateVisits';

// Ejecutar la limpieza todos los días a las 12:00 AM
cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando limpieza de reservas antiguas a la medianoche...');
    await deleteOldReservations();

    console.log('Actualizando contadores de visitas a la medianoche...');
    await updateVisits();
});