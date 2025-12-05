// src/components/organization/ContactInfo.jsx
import React, { useMemo } from "react";
import { 
    Mail, 
    MapPin, 
    Globe, 
    User, 
    // eslint-disable-next-line no-unused-vars
    Briefcase, 
    Phone, 
    Tags, 
    // eslint-disable-next-line no-unused-vars
    Building2 
} from "lucide-react";

const ContactInfo = ({ selectedOrg }) => {
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
            console.error("Error parseando metadata", e);
        }

        let interests = [];
        try {
            if (typeof selectedOrg.intereses === "string") {
                interests = JSON.parse(selectedOrg.intereses);
            } else if (Array.isArray(selectedOrg.intereses)) {
                interests = selectedOrg.intereses;
            }
            if (interests.length === 0 && meta.organizacion?.intereses) {
                interests = meta.organizacion.intereses;
            }
        } catch (e) {
            if (typeof selectedOrg.intereses === "string") {
                interests = selectedOrg.intereses.split(',').map(s => s.trim());
            }
        }

        let contactName = selectedOrg.nombres_org;
        if (!contactName || contactName === "[]" || contactName === "indefinido") {
            contactName = selectedOrg.nombre_contacto;
        }
        if (contactName === "[]" || contactName === "indefinido") contactName = null;

        let webUrl = selectedOrg.url || meta.organizacion?.url;
        if (webUrl === "indefinido") webUrl = null;

        return {
            contactName,
            role: selectedOrg.rol || meta.organizacion?.cargo,
            email: selectedOrg.id && selectedOrg.id.includes("@") ? selectedOrg.id : null,
            phone: selectedOrg.telefono || meta.organizacion?.telefono,
            address: selectedOrg.direccion || meta.organizacion?.direccion,
            web: webUrl,
            location: [
                selectedOrg.municipio, 
                selectedOrg.isla, 
                (!selectedOrg.isla && meta.ubicacion?.provincia)
            ].filter(Boolean).join(", "),
            
            interests: Array.isArray(interests) ? interests : [],
            type: selectedOrg.sub_tipo_entidad || selectedOrg.tipo_entidad,
            entityName: selectedOrg.organizacion || selectedOrg.nombre
        };
    }, [selectedOrg]);

    if (!info) return null;

    const hasData = Object.values(info).some(val => 
        Array.isArray(val) ? val.length > 0 : Boolean(val)
    );

    if (!hasData) return null;

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 h-full">
            <div className="flex justify-between items-start mb-6 border-b pb-4 border-gray-100 dark:border-gray-700">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Ficha de Contacto
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {info.entityName}
                    </p>
                </div>
                {info.type && (
                    <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                        {info.type.replace(/_/g, " ")}
                    </span>
                )}
            </div>
            
            <div className="space-y-5">
                {/* Persona de Contacto */}
                {info.contactName && (
                    <div className="flex items-start gap-3 group">
                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                            <User className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Contacto Principal
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {info.contactName}
                            </p>
                            {info.role && info.role !== "[vacio]" && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {info.role}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Email & Teléfono */}
                {(info.email || info.phone) && (
                    <div className="grid grid-cols-1 gap-4">
                        {info.email && (
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
                                    <Mail className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Email
                                    </p>
                                    <a href={`mailto:${info.email}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block">
                                        {info.email}
                                    </a>
                                </div>
                            </div>
                        )}
                        {info.phone && (
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                                    <Phone className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Teléfono
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {info.phone}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Intereses */}
                {info.interests.length > 0 && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <Tags className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Áreas de Interés
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {info.interests.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Ubicación y Web */}
                {(info.location || info.address || info.web) && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                        {(info.location || info.address) && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {info.address && <p>{info.address}</p>}
                                    {info.location && <p className="font-medium text-gray-800 dark:text-gray-200">{info.location}</p>}
                                </div>
                            </div>
                        )}

                        {info.web && (
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <a 
                                    href={info.web} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[250px]"
                                >
                                    {info.web}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactInfo;