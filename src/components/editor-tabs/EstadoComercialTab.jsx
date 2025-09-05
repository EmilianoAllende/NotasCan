import React from 'react';

const EstadoComercialTab = ({ data, handleChange }) => (
    <div className="space-y-6">
        <div className="p-4 bg-orange-50 rounded-lg dark:bg-gray-700/50">
            <h3 className="mb-4 text-sm font-semibold text-orange-900 dark:text-orange-200">Estado comercial</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Estado del cliente</label>
                    <select
                        name="estado_cliente"
                        value={data.estado_cliente || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="">Seleccionar</option>
                        <option value="1">Cliente</option>
                        <option value="2">Prospecto</option>
                        <option value="3">Lead</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Suscripción</label>
                    <select
                        name="suscripcion"
                        value={data.suscripcion || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="">Seleccionar</option>
                        <option value="activa">Activa</option>
                        <option value="pausada">Pausada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Días sin contacto</label>
                    <input
                        type="number"
                        name="dias_sin_contacto"
                        value={data.dias_sin_contacto || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        min="0"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Frecuencia de comunicación</label>
                    <select
                        name="frecuencia_comunicacion"
                        value={data.frecuencia_comunicacion || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="">Seleccionar</option>
                        <option value="Muy Alta">Muy Alta</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg dark:bg-gray-700/50">
            <h3 className="mb-4 text-sm font-semibold text-green-900 dark:text-green-200">Actividad reciente</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Fecha último posteo</label>
                    <input
                        type="date"
                        name="ultimo_posteo"
                        value={data.ultimo_posteo || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Hace días (última interacción)</label>
                    <input
                        type="number"
                        name="hace_dias"
                        value={data.hace_dias || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        placeholder="Número de días"
                        min="0"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">URL del último posteo</label>
                    <input
                        type="url"
                        name="url_posteo"
                        value={data.url_posteo || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        placeholder="https://..."
                    />
                </div>

                <div className="col-span-2">
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Título del último posteo</label>
                    <textarea
                        name="titulo_posteo"
                        value={data.titulo_posteo || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        rows={2}
                    />
                </div>

                <div className="col-span-2">
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Actividad reciente</label>
                    <textarea
                        name="actividad_reciente"
                        value={data.actividad_reciente || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        rows={3}
                        placeholder="Describe la última actividad o interacción..."
                    />
                </div>
            </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700/50">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-200">Resumen del estado actual</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                    <span>Estado del cliente:</span>
                    <span className="font-medium">{data.estado_cliente === '1' ? 'Cliente' : data.estado_cliente === '2' ? 'Prospecto' : data.estado_cliente === '3' ? 'Lead' : 'No definido'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Días sin contacto:</span>
                    <span className="font-medium">{data.dias_sin_contacto || 'No registrado'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Última interacción:</span>
                    <span className="font-medium">{data.hace_dias ? `Hace ${data.hace_dias} días` : 'No registrada'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Frecuencia de comunicación:</span>
                    <span className="font-medium">{data.frecuencia_comunicacion || 'No definida'}</span>
                </div>
            </div>
        </div>
    </div>
);

export default EstadoComercialTab;