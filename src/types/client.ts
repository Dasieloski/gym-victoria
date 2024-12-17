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
        createdAt: string;
    };
    membresias: {
        id: number;
        tipo: string;
        fechaInicio: string;
        fechaFin: string;
        estadoPago: string;
        createdAt: string;
    }[];
    entrenadorAsignado?: {
        id: number;
        nombre: string;
    };
    diasParaPagar?: number;
}