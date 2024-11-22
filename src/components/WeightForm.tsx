"use client"

import React, { useState } from 'react';
import { WeightRecord } from '@/types/types';

interface WeightRecordPartial {
    peso: number;
    grasaCorporal: number;
    cintura: number;
    cadera: number;
    cuello: number;
    pecho: number;
    brazo: number;
    muslo: number;
    altura: number;
    gluteo?: number;
    imc?: number;
}

interface WeightFormProps {
    onSubmit: (data: WeightRecordPartial) => Promise<void>;
    onCancel: () => void;
    lastRecord?: WeightRecord;
}

// Definir un tipo para el estado del formulario que permita cadenas vacías
interface FormData {
    peso: string;
    grasaCorporal: string;
    cuello: string;
    pecho: string;
    brazo: string;
    cintura: string;
    cadera: string;
    muslo: string;
    altura: string;
    gluteo: string;
}

const WeightForm: React.FC<WeightFormProps> = ({ onSubmit, onCancel, lastRecord }) => {
    const [formData, setFormData] = useState<FormData>({
        peso: '',
        grasaCorporal: '',
        cuello: '',
        pecho: '',
        brazo: '',
        cintura: '',
        cadera: '',
        muslo: '',
        altura: '',
        gluteo: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value, // Mantener los valores como cadenas
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que todos los campos obligatorios estén llenos
        const requiredFields: Array<keyof FormData> = ['peso', 'cintura', 'cadera', 'cuello', 'pecho', 'brazo', 'muslo', 'altura'];
        const allFieldsFilled = requiredFields.every(field => formData[field].trim() !== '');
        if (!allFieldsFilled) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Asegurar que los valores sean números
        const peso = parseFloat(formData.peso);
        const altura = parseFloat(formData.altura);
        const imc = altura > 0 ? peso / Math.pow(altura / 100, 2) : 0;

        const data: WeightRecordPartial = {
            peso,
            cintura: parseFloat(formData.cintura),
            cadera: parseFloat(formData.cadera),
            cuello: parseFloat(formData.cuello),
            pecho: parseFloat(formData.pecho),
            brazo: parseFloat(formData.brazo),
            muslo: parseFloat(formData.muslo),
            altura,
            gluteo: formData.gluteo.trim() !== '' ? parseFloat(formData.gluteo) : undefined,
            grasaCorporal: formData.grasaCorporal.trim() !== '' ? parseFloat(formData.grasaCorporal) : 0,
            imc,
        };

        // Validar si hay NaN
        const hasNaN = Object.values(data).some(value => isNaN(value));
        if (hasNaN) {
            alert('Por favor, ingresa valores numéricos válidos.');
            return;
        }

        await onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Peso */}
                <div>
                    <label htmlFor="peso" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Peso (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="peso"
                        name="peso"
                        value={formData.peso}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Altura */}
                <div>
                    <label htmlFor="altura" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Altura (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="altura"
                        name="altura"
                        value={formData.altura}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Cuello */}
                <div>
                    <label htmlFor="cuello" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Cuello (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="cuello"
                        name="cuello"
                        value={formData.cuello}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Pecho */}
                <div>
                    <label htmlFor="pecho" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Pecho (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="pecho"
                        name="pecho"
                        value={formData.pecho}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Brazo */}
                <div>
                    <label htmlFor="brazo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Brazo (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="brazo"
                        name="brazo"
                        value={formData.brazo}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Cintura */}
                <div>
                    <label htmlFor="cintura" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Cintura (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="cintura"
                        name="cintura"
                        value={formData.cintura}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Cadera */}
                <div>
                    <label htmlFor="cadera" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Cadera (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="cadera"
                        name="cadera"
                        value={formData.cadera}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Muslo */}
                <div>
                    <label htmlFor="muslo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Muslo (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="muslo"
                        name="muslo"
                        value={formData.muslo}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Glúteo */}
                <div>
                    <label htmlFor="gluteo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Glúteo (cm)
                    </label>
                    <input
                        type="number"
                        id="gluteo"
                        name="gluteo"
                        value={formData.gluteo}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                    />
                </div>
                {/* Grasa Corporal */}
                <div className="sm:col-span-2">
                    <label htmlFor="grasaCorporal" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Grasa Corporal (%) 
                    </label>
                    <input
                        type="number"
                        id="grasaCorporal"
                        name="grasaCorporal"
                        value={formData.grasaCorporal}
                        onChange={handleChange}
                        placeholder={''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                    />
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-5 py-2 rounded-lg shadow-sm text-sm font-semibold text-white bg-[#2272FF] hover:bg-[#1b5acc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2272FF]"
                >
                    Guardar
                </button>
            </div>
        </form>
    );
};

export default WeightForm;