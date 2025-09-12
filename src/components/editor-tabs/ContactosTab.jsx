import React from 'react';

const ContactosTab = ({ data, handleChange }) => (
    <div className="space-y-6">
        <div className="p-4 bg-yellow-50 rounded-lg dark:bg-gray-700/50 border-l-4 border-yellow-400">
            <h3 className="mb-4 text-sm font-semibold text-yellow-900 dark:text-yellow-200">Contacto Principal para Campañas</h3>
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">Este contacto se usará específicamente para el envío de campañas de email.</p>
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">Datos principales obtenidos por el sistema.</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Nombre del contacto principal</label>
                    <input
                        type="text"
                        name="nombres_org"
                        value={data.nombres_org || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        placeholder="Ej: María García"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Cargo/Rol</label>
                    <input
                        type="text"
                        name="rol"
                        value={data.rol || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        placeholder="Ej: Vicepresidente Ejecutivo"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Teléfono principal</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={data.telefono || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        placeholder="+34 XXX XX XX XX"
                    />
                </div>
            </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg dark:bg-gray-700/50">
            <h3 className="mb-4 text-sm font-semibold text-indigo-900 dark:text-indigo-200">Otros Contactos institucionales</h3>
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">Datos adicionales obtenidos para enriquecer el perfil.</p>
            <div className="mb-4">
                <h4 className="mb-3 text-xs font-semibold text-indigo-800 dark:text-indigo-300">Contacto 1</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
                        <input
                        type="text"
                        name="contacto1_nombre"
                        value={data.contacto1_nombre || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Cargo</label>
                        <input
                        type="text"
                        name="contacto1_cargo"
                        value={data.contacto1_cargo || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                        type="email"
                        name="contacto1_email"
                        value={data.contacto1_email || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                        <input
                        type="tel"
                        name="contacto1_telefono"
                        value={data.contacto1_telefono || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h4 className="mb-3 text-xs font-semibold text-indigo-800 dark:text-indigo-300">Contacto 2</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
                        <input
                        type="text"
                        name="contacto2_nombre"
                        value={data.contacto2_nombre || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Cargo</label>
                        <input
                        type="text"
                        name="contacto2_cargo"
                        value={data.contacto2_cargo || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                        type="email"
                        name="contacto2_email"
                        value={data.contacto2_email || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                        <input
                        type="tel"
                        name="contacto2_telefono"
                        value={data.contacto2_telefono || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default ContactosTab;