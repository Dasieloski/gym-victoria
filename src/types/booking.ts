export interface Booking {
    id: number;
    fecha: string;
    estado: string;
    cliente: {
        nombre: string;
    };
    entrenadorNombre: string;
}