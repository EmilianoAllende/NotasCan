// src/components/organization/DetailHeader.jsx
import React, { useMemo } from "react";
import { 
    ExternalLink, 
    MapPin, 
    Calendar, 
    Briefcase, 
    Hash,
    Building2,
    ArrowLeft // 1. Importamos el icono
} from "lucide-react";

// 2. Recibimos 'onBack' en los props
const DetailHeader = ({ selectedOrg, StatusBadge, onBack }) => {
    
    // Lógica de procesamiento de datos
    const info = useMemo(() => {
        if (!selectedOrg) return null;

        let meta = {};
        try {
            if (typeof selectedOrg.metadata === "string" && selectedOrg.metadata !== "indefinido") {
                meta = JSON.parse(selectedOrg.metadata);
            } else if (typeof selectedOrg.metadata === "object") {
                meta = selectedOrg.metadata;
            }
        } catch (e) {
            console.error("Error parsing metadata in header", e);
        }

        let actividad = selectedOrg.actividad_principal;
        if (!actividad && meta.organizacion?.actividad_principal) {
            actividad = meta.organizacion.actividad_principal;
        }

        return {
            name: selectedOrg.organizacion || selectedOrg.nombre,
            id: selectedOrg.id,
            municipio: selectedOrg.municipio || meta.ubicacion?.municipio,
            isla: selectedOrg.isla || meta.ubicacion?.isla,
            type: (selectedOrg.sub_tipo_entidad || selectedOrg.tipo_entidad || meta.organizacion?.tipo || "Sin clasificar").replace(/_/g, " "),
            activity: actividad || "No especificada",
            created: selectedOrg.created_date ? new Date(selectedOrg.created_date).toLocaleDateString() : null,
            url: selectedOrg.url && selectedOrg.url !== "indefinido" ? selectedOrg.url : null
        };
    }, [selectedOrg]);

    if (!info) return null;

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            
            {/* 3. Botón 'Volver' integrado DENTRO de la tarjeta */}
            <div className="mb-4">
                <button
                    onClick={onBack}
                    className="group inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-200"
                >
                    <ArrowLeft size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    Volver a Gestión
                </button>
            </div>

            {/* Cabecera Principal */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {info.name}
                        </h2>
                        {StatusBadge && <StatusBadge estado={selectedOrg.estado_cliente} />}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Hash size={14} /> {info.id}
                        </span>
                        {info.created && (
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> Registrado: {info.created}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid de Detalles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Ubicación */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ubicación</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {info.municipio || "Municipio N/A"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {info.isla || "Isla N/A"}
                        </p>
                    </div>
                </div>

                {/* 2. Tipo de Entidad */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Building2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tipo Entidad</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {info.type}
                        </p>
                    </div>
                </div>

                {/* 3. Actividad Principal */}
                <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Briefcase className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actividad Principal</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                            {info.activity}
                        </p>
                        {info.url && (
                            <a
                                href={info.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Visitar sitio web <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailHeader;