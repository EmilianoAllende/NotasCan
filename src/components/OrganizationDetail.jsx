import React from 'react';
import { Mail, Edit, ExternalLink } from 'lucide-react';
import StatusBadge from './shared/StatusBadge';

const OrganizationDetail = ({ 
    selectedOrg, 
    openEditModal, 
    setShowCampaignModal,
    // --- NUEVAS PROPS ---
    selectedCampaignId,
    onSelectCampaignRequired 
}) => {
    if (!selectedOrg) {
        return (
        <div className="flex items-center justify-center h-full">
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Selecciona una organización de la lista para ver sus detalles.</p>
            </div>
        </div>
        );
    }

// Parseamos el campo metadata si existe y es un string JSON válido
    let metadata = {};
    try {
        if (typeof selectedOrg.metadata === 'string' && selectedOrg.metadata !== 'indefinido') {
            metadata = JSON.parse(selectedOrg.metadata);
        }
    } catch (e) {
        console.error("Error al parsear metadata:", e);
    }
    
    const orgInfo = metadata.organizacion || {};

    return (
        <div className="space-y-6 max-h-auto overflow-y-auto pr-2">
            {/* --- Encabezado de la Organización --- */}
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedOrg.organizacion || selectedOrg.nombre}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{selectedOrg.id}</p>
                    </div>
                    <StatusBadge estado={selectedOrg.estado_cliente} />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Municipio</p>
                        <p className="font-medium dark:text-gray-200">{selectedOrg.municipio || 'No especificado'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Isla</p>
                    <p className="font-medium dark:text-gray-200">{selectedOrg.isla || 'No especificado'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
                    <p className="font-medium dark:text-gray-200">{orgInfo.tipo || 'Sin clasificar'}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Actividad Principal</p>
                    <p className="font-medium dark:text-gray-200">{selectedOrg.actividad_principal || orgInfo.actividad_principal || 'No especificado'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
                    <p className="font-medium dark:text-gray-200">{selectedOrg.created_date ? new Date(selectedOrg.created_date).toLocaleDateString() : 'No especificada'}</p>
                </div>
                {selectedOrg.url && selectedOrg.url !== 'indefinido' && (
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sitio Web</p>
                        <a href={selectedOrg.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {selectedOrg.url} <ExternalLink size={14} />
                        </a>
                    </div>
                )}
                </div>
            </div>

            {/* --- Información de Contacto --- */}
            {(selectedOrg.nombres_org || selectedOrg.nombre_contacto || orgInfo.contacto_principal) && (
                <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Información de contacto</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {selectedOrg.nombres_org && selectedOrg.nombres_org !== 'indefinido' && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Contacto Principal (Campañas)</p>
                                <p className="font-medium text-blue-600 dark:text-blue-400">{selectedOrg.nombres_org}</p>
                            </div>
                        )}
                        {selectedOrg.nombre_contacto && selectedOrg.nombre_contacto !== 'indefinido' && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Contacto general</p>
                                <p className="font-medium dark:text-gray-200">{selectedOrg.nombre_contacto}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cargo</p>
                            <p className="font-medium dark:text-gray-200">{selectedOrg.rol || orgInfo.contacto_principal?.cargo || '[vacio]'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                            <p className="font-medium text-blue-600 dark:text-blue-400">{selectedOrg.telefono || orgInfo.contacto_principal?.telefono || '[vacio]'}</p>
                        </div>
                        {selectedOrg.direccion && selectedOrg.direccion !== 'indefinido' && (
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                                <p className="font-medium dark:text-gray-200">{selectedOrg.direccion}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- Análisis de Actividad y Temas --- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Actividad Comunicacional</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="dark:text-gray-300">Frecuencia:</span>
                            <span className="font-medium dark:text-gray-200">{
                                (selectedOrg.frecuencia_comunicacion && selectedOrg.frecuencia_comunicacion !== 'indefinido')
                                    ? selectedOrg.frecuencia_comunicacion
                                    : ((selectedOrg.frecuencia && selectedOrg.frecuencia !== 'indefinido')
                                        ? selectedOrg.frecuencia
                                        : 'N/A')
                            }</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="dark:text-gray-300">Último posteo:</span>
                            <span className="font-medium dark:text-gray-200">{selectedOrg.ultimo_posteo || 'No registrado'}</span>
                        </div>
                        {selectedOrg.titulo_posteo && selectedOrg.titulo_posteo !== 'indefinido' && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Título del último posteo</p>
                                <p className="font-medium dark:text-gray-200">{selectedOrg.titulo_posteo}</p>
                                {selectedOrg.url_posteo && selectedOrg.url_posteo !== 'indefinido' && (
                                    <a href={selectedOrg.url_posteo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                        Ver posteo <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="dark:text-gray-300">Suscripción:</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                selectedOrg.suscripcion === 'activa' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                                {selectedOrg.suscripcion || 'No especificada'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Temas Principales (Intereses)</h3>
                    <div className="flex flex-wrap gap-2">
                        {orgInfo.intereses?.length > 0 ? (
                        orgInfo.intereses.map((tema, index) => (
                            <span
                            key={index}
                            className="inline-block px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200"
                            >
                            {tema}
                            </span>
                        ))
                        ) : (
                        <p className="italic text-gray-500 dark:text-gray-400">Análisis pendiente</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Acciones Disponibles --- */}
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Acciones disponibles</h3>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => openEditModal(selectedOrg)}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                        <Edit size={16} />
                        Editar Contacto
                    </button>

                    <button
                        onClick={() => {
                            if (selectedCampaignId) {
                                setShowCampaignModal(true);
                            } else {
                                onSelectCampaignRequired(); // Muestra notificación de error
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Mail size={16} />
                        Enviar email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrganizationDetail;