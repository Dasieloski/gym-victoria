"use client"

import React, { useState } from 'react';

interface WeightRecordPartial {
    peso: number;
    imc: number;
    grasaCorporal: number;
    cuello: number;
    pecho: number;
    brazo: number;
    cintura: number;
    cadera: number;
    muslo: number;
    altura: number;
}

interface WeightFormProps {
    onSubmit: (data: WeightRecordPartial) => Promise<void>;
    onCancel: () => void;
    lastRecord?: WeightRecordPartial;
}

// Definir un tipo para el estado del formulario que permita cadenas vacías
interface FormData {
    peso: string;
    imc: string;
    grasaCorporal: string;
    cuello: string;
    pecho: string;
    brazo: string;
    cintura: string;
    cadera: string;
    muslo: string;
    altura: string;
}

const WeightForm: React.FC<WeightFormProps> = ({ onSubmit, onCancel, lastRecord }) => {
    const [formData, setFormData] = useState<FormData>({
        peso: '',
        imc: '',
        grasaCorporal: '',
        cuello: '',
        pecho: '',
        brazo: '',
        cintura: '',
        cadera: '',
        muslo: '',
        altura: '',
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

        // Validar que todos los campos estén llenos
        const allFieldsFilled = Object.values(formData).every(value => value.trim() !== '');
        if (!allFieldsFilled) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Asegurar que los valores sean números
        const data: WeightRecordPartial = {
            peso: parseFloat(formData.peso),
            imc: parseFloat(formData.imc),
            grasaCorporal: parseFloat(formData.grasaCorporal),
            cuello: parseFloat(formData.cuello),
            pecho: parseFloat(formData.pecho),
            brazo: parseFloat(formData.brazo),
            cintura: parseFloat(formData.cintura),
            cadera: parseFloat(formData.cadera),
            muslo: parseFloat(formData.muslo),
            altura: parseFloat(formData.altura),
        };

        // Validar que la conversión a número fue exitosa
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
                    <label htmlFor="peso" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Peso (kg)</label>
                    <input
                        type="number"
                        id="peso"
                        name="peso"
                        value={formData.peso}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.peso.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Altura */}
                <div>
                    <label htmlFor="altura" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Altura (cm)</label>
                    <input
                        type="number"
                        id="altura"
                        name="altura"
                        value={formData.altura}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.altura.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* IMC */}
                <div>
                    <label htmlFor="imc" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">IMC</label>
                    <input
                        type="number"
                        id="imc"
                        name="imc"
                        value={formData.imc}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.imc.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Grasa Corporal */}
                <div>
                    <label htmlFor="grasaCorporal" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Grasa Corporal (%)</label>
                    <input
                        type="number"
                        id="grasaCorporal"
                        name="grasaCorporal"
                        value={formData.grasaCorporal}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.grasaCorporal.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Cuello */}
                <div>
                    <label htmlFor="cuello" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Cuello (cm)</label>
                    <input
                        type="number"
                        id="cuello"
                        name="cuello"
                        value={formData.cuello}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.cuello.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Pecho */}
                <div>
                    <label htmlFor="pecho" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Pecho (cm)</label>
                    <input
                        type="number"
                        id="pecho"
                        name="pecho"
                        value={formData.pecho}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.pecho.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Brazo */}
                <div>
                    <label htmlFor="brazo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Brazo (cm)</label>
                    <input
                        type="number"
                        id="brazo"
                        name="brazo"
                        value={formData.brazo}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.brazo.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Cintura */}
                <div>
                    <label htmlFor="cintura" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Cintura (cm)</label>
                    <input
                        type="number"
                        id="cintura"
                        name="cintura"
                        value={formData.cintura}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.cintura.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Cadera */}
                <div>
                    <label htmlFor="cadera" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Cadera (cm)</label>
                    <input
                        type="number"
                        id="cadera"
                        name="cadera"
                        value={formData.cadera}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.cadera.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
                    />
                </div>
                {/* Muslo */}
                <div>
                    <label htmlFor="muslo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Muslo (cm)</label>
                    <input
                        type="number"
                        id="muslo"
                        name="muslo"
                        value={formData.muslo}
                        onChange={handleChange}
                        placeholder={lastRecord ? lastRecord.muslo.toString() : ''}
                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50 py-2 px-3 bg-white dark:bg-gray-600 text-black dark:text-gray-100"
                        required
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