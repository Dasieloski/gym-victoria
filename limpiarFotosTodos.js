const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Configuración segura
const SUPABASE_URL = 'https://yrhjeqezlmzpckjyhhuf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGplcWV6bG16cGNranloaHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjg5NTI2NywiZXhwIjoyMDQyNDcxMjY3fQ.-GWnmSY5l3cHbrMw00N91CvugppMOE_kquMA36pYOZ8';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const prisma = new PrismaClient();

const bucket = 'profile-images';
const carpeta = 'public'; // Si tus fotos están en profile-images/public/

async function limpiarFotosDuplicadasTodos() {
    try {
        // 1. Obtén todos los usuarios y su foto válida
        const usuarios = await prisma.usuario.findMany({
            where: { foto: { not: null } },
            select: { username: true, foto: true }
        });

        // 2. Lista todos los archivos en la carpeta del bucket
        const { data: files, error } = await supabase.storage.from(bucket).list(carpeta, { limit: 10000 });
        if (error) {
            console.error('Error al listar archivos:', error);
            return;
        }

        // 3. Para cada usuario, elimina las fotos que no sean la válida
        for (const usuario of usuarios) {
            // Extrae solo el nombre del archivo de la URL guardada en la BD
            let fotoValida = null;
            if (usuario.foto) {
                try {
                    // Si la foto es una URL, extrae el nombre del archivo
                    const url = new URL(usuario.foto);
                    fotoValida = decodeURIComponent(url.pathname.split('/').pop());
                } catch {
                    // Si ya es solo el nombre, úsalo directo
                    fotoValida = usuario.foto;
                }
            }

            // Filtra archivos que empiezan con el username
            const archivosUsuario = files.filter(file => file.name.startsWith(usuario.username));
            for (const archivo of archivosUsuario) {
                if (archivo.name !== fotoValida) {
                    // Confirmación extra antes de borrar
                    console.log(`[PREVIEW] Se eliminaría: ${archivo.name} para usuario ${usuario.username}`);
                    // Descomenta la siguiente línea SOLO cuando estés seguro:
                    const { error: deleteError } = await supabase.storage.from(bucket).remove([`${carpeta}/${archivo.name}`]);
                    if (deleteError) {
                        console.error(`Error al eliminar ${archivo.name}:`, deleteError);
                    } else {
                        console.log(`Eliminado: ${archivo.name}`);
                    }
                }
            }
        }

        await prisma.$disconnect();
        console.log('PREVIEW completado. Si todo está correcto, descomenta la línea de borrado para ejecutar el borrado real.');
    } catch (err) {
        console.error('Error general:', err);
        await prisma.$disconnect();
    }
}

limpiarFotosDuplicadasTodos();
