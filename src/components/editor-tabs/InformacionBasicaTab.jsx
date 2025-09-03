import React from 'react';

const InformacionBasicaTab = ({ data, handleChange }) => (
    <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg dark:bg-gray-700/50">
            <h3 className="mb-4 text-sm font-semibold text-blue-900 dark:text-blue-200">Información básica</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Nombre principal</label>
                    <input
                        type="text"
                        name="nombre"
                        value={data.nombre || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Email principal (ID)</label>
                    <input
                        type="email"
                        name="id"
                        value={data.id || ''}
                        readOnly
                        className="w-full px-2 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded dark:bg-gray-900 dark:border-gray-600 dark:text-gray-400"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Organización completa</label>
                    <input
                        type="text"
                        name="organizacion"
                        value={data.organizacion || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Tipo de entidad</label>
                    <select
                        name="tipo_entidad"
                        value={data.tipo_entidad || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="">Seleccionar</option>
                        <option value="Administración Pública">Administración Pública</option>
                        <option value="Empresa">Empresa</option>
                        <option value="Asociación">Asociación</option>
                        <option value="Fundación">Fundación</option>
                        <option value="ONG">ONG</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">URL principal</label>
                    <input
                        type="url"
                        name="url"
                        value={data.url || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        placeholder="https://..."
                    />
                </div>

                <div className="col-span-2">
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Actividad principal</label>
                    <textarea
                        name="actividad_principal"
                        value={data.actividad_principal || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        rows={2}
                    />
                </div>
            </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg dark:bg-gray-700/50">
            <h3 className="mb-4 text-sm font-semibold text-green-900 dark:text-green-200">Ubicación geográfica</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Municipio</label>
                    <input
                        type="text"
                        name="municipio"
                        value={data.municipio || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Isla</label>
                    <select
                        name="isla"
                        value={data.isla || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="">Seleccionar</option>
                        <option value="Gran Canaria">Gran Canaria</option>
                        <option value="Tenerife">Tenerife</option>
                        <option value="Lanzarote">Lanzarote</option>
                        <option value="Fuerteventura">Fuerteventura</option>
                        <option value="La Palma">La Palma</option>
                        <option value="La Gomera">La Gomera</option>
                        <option value="El Hierro">El Hierro</option>
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Dirección completa</label>
                    <textarea
                        name="direccion"
                        value={data.direccion || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        rows={2}
                    />
                </div>
            </div>
        </div>
    </div>
);

export default InformacionBasicaTab;