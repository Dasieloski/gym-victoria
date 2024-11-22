// src/types/types.ts
export interface WeightRecord {
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
    gluteo?: number; // Haz que sea opcional si puede no estar presente
}