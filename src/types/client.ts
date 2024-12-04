export interface ClientType {
    id: number;
    nombre: string;
    username?: string;
    carnetIdentidad: string;
    telefono: string;
    rol: string;
    foto?: string;
    membresiaActual?: {
        id: number;
        tipo: string;
        fechaInicio: string;
        fechaFin: string;
        estadoPago: string;
    };
    membresias: {
        id: number;
        tipo: string;
        fechaInicio: string;
        fechaFin: string;
        estadoPago: string;
    }[];
    entrenadorAsignado?: {
        id: number;
        nombre: string;
    };
}