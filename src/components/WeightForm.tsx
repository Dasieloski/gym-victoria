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
}

const WeightForm: React.FC<WeightFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<WeightRecordPartial>({
    peso: 0,
    imc: 0,
    grasaCorporal: 0,
    cuello: 0,
    pecho: 0,
    brazo: 0,
    cintura: 0,
    cadera: 0,
    muslo: 0,
    altura: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="peso" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
          <input
            type="number"
            id="peso"
            name="peso"
            value={formData.peso}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="altura" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura (cm)</label>
          <input
            type="number"
            id="altura"
            name="altura"
            value={formData.altura}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="imc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">IMC</label>
          <input
            type="number"
            id="imc"
            name="imc"
            value={formData.imc}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="grasaCorporal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grasa Corporal (%)</label>
          <input
            type="number"
            id="grasaCorporal"
            name="grasaCorporal"
            value={formData.grasaCorporal}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="cuello" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuello (cm)</label>
          <input
            type="number"
            id="cuello"
            name="cuello"
            value={formData.cuello}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="pecho" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pecho (cm)</label>
          <input
            type="number"
            id="pecho"
            name="pecho"
            value={formData.pecho}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="brazo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brazo (cm)</label>
          <input
            type="number"
            id="brazo"
            name="brazo"
            value={formData.brazo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="cintura" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cintura (cm)</label>
          <input
            type="number"
            id="cintura"
            name="cintura"
            value={formData.cintura}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="cadera" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cadera (cm)</label>
          <input
            type="number"
            id="cadera"
            name="cadera"
            value={formData.cadera}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="muslo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Muslo (cm)</label>
          <input
            type="number"
            id="muslo"
            name="muslo"
            value={formData.muslo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2272FF] focus:ring focus:ring-[#2272FF] focus:ring-opacity-50"
            required
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2272FF]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2272FF] hover:bg-[#1b5acc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2272FF]"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default WeightForm;