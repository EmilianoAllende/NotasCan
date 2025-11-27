// src/components/editor-tabs/ContactEditor.jsx
import React, { useState, useEffect, useMemo } from "react";
// 1. IMPORTAMOS EL ICONO 'Lock'
import { 
    ArrowLeft, Save, Globe, MapPin, User, Tag, Building, 
    // eslint-disable-next-line no-unused-vars
    Mail, Phone, Briefcase, Lock 
} from "lucide-react";
import { TIPOS_ENTIDAD, SUBTIPOS_POR_ENTIDAD } from "../../utils/organizationUtils";

const ContactEditor = ({ selectedOrg, onSave, onCancel, isSaving, onBack }) => {
    const [formData, setFormData] = useState({});

    // Helper para formatear etiquetas
    const formatLabel = (str) => {
        if (!str) return "";
        return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // --- LÓGICA DE CARGA ---
    useEffect(() => {
        if (selectedOrg) {
            const processedData = { ...selectedOrg };

            // Arrays a String
            ['intereses', 'nombres_org'].forEach(field => {
                if (typeof processedData[field] === 'string' && processedData[field].startsWith('[')) {
                    try {
                        const parsed = JSON.parse(processedData[field]);
                        if (Array.isArray(parsed)) {
                            processedData[field] = parsed.join(', ');
                        }
                    } catch (e) {}
                }
            });

            // Rol: Tomar solo el primero
            if (typeof processedData.rol === 'string' && processedData.rol.startsWith('[')) {
                try {
                    const parsedRol = JSON.parse(processedData.rol);
                    if (Array.isArray(parsedRol) && parsedRol.length > 0) {
                        processedData.rol = parsedRol[0];
                    } else if (Array.isArray(parsedRol) && parsedRol.length === 0) {
                         processedData.rol = "";
                    }
                } catch (e) {}
            }

            setFormData(processedData);
        }
    }, [selectedOrg]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "tipo_entidad") {
            setFormData(prev => ({ ...prev, [name]: value, sub_tipo_entidad: "" }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const availableSubtypes = useMemo(() => {
        if (!formData.tipo_entidad) return [];
        return SUBTIPOS_POR_ENTIDAD[formData.tipo_entidad] || [];
    }, [formData.tipo_entidad]);

    if (!formData.id && !formData.organizacion) return null;

    // --- COMPONENTES UI ---
    
    const SectionHeader = ({ icon: Icon, title, colorClass, bgClass }) => (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bgClass}`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                    {title}
                </h3>
            </div>
        </div>
    );

    const InputField = ({ label, name, icon: Icon, type = "text", className = "", disabled, ...props }) => (
        <div className={`group ${className}`}>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {/* Si está disabled, el icono se ve más gris */}
                        <Icon className={`h-4 w-4 transition-colors ${disabled ? 'text-gray-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`
                        block w-full rounded-lg border 
                        ${disabled 
                            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:focus:bg-gray-700'}
                        shadow-sm sm:text-sm py-2.5 transition-all 
                        ${Icon ? 'pl-10' : 'pl-4'}
                    `}
                    {...props}
                />
            </div>
        </div>
    );

    const SelectField = ({ label, name, options, disabled = false, ...props }) => (
        <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {label}
            </label>
            <div className="relative">
                <select
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-2.5 pl-4 transition-all appearance-none ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    {...props}
                >
                    {options}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50/50 dark:bg-gray-900 transition-colors">
            
            {/* --- CABECERA --- */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack || onCancel}
                        className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-all"
                        title="Volver atrás"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            Editar Organización
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-xs sm:max-w-md">
                            {formData.organizacion || formData.nombre || "Nueva Organización"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white transition-all shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                        <Save size={18} />
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>

            {/* --- CUERPO --- */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-10">
                    
                    {/* SECCIÓN 1: DATOS GENERALES */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                        <SectionHeader 
                            icon={Building} 
                            title="Información General" 
                            colorClass="text-blue-600 dark:text-blue-400"
                            bgClass="bg-blue-100 dark:bg-blue-900/30"
                        />
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <InputField 
                                    label="Nombre Organización" 
                                    name="organizacion" 
                                    placeholder="Nombre oficial de la entidad"
                                    className="col-span-2"
                                />
                            </div>
                            
                            {/* --- CAMBIO AQUÍ: ID BLOQUEADO CON CANDADO --- */}
                            <InputField 
                                label="Email (ID) - No Editable" 
                                name="id" 
                                icon={Lock} // Icono de candado
                                disabled={true} // Input deshabilitado
                                title="El ID es único y no se puede modificar"
                            />
                            
                            <InputField 
                                label="Sitio Web" 
                                name="url" 
                                icon={Globe} 
                                placeholder="https://www.ejemplo.com"
                            />

                            <InputField 
                                label="Teléfono" 
                                name="telefono" 
                                icon={Phone} 
                                placeholder="+34 928..."
                            />

                            <SelectField label="Suscripción" name="suscripcion"
                                options={
                                    <>
                                        <option value="activa">Activa</option>
                                        <option value="inactiva">Inactiva</option>
                                    </>
                                }
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 2: UBICACIÓN */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                        <SectionHeader 
                            icon={MapPin} 
                            title="Ubicación" 
                            colorClass="text-green-600 dark:text-green-400"
                            bgClass="bg-green-100 dark:bg-green-900/30"
                        />

                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3">
                                <InputField label="Dirección Completa" name="direccion" placeholder="Calle, Número..." />
                            </div>
                            
                            <InputField label="Municipio" name="municipio" />
                            
                            <SelectField label="Isla" name="isla"
                                options={
                                    <>
                                        <option value="">Seleccionar...</option>
                                        <option value="Gran Canaria">Gran Canaria</option>
                                        <option value="Tenerife">Tenerife</option>
                                        <option value="Lanzarote">Lanzarote</option>
                                        <option value="Fuerteventura">Fuerteventura</option>
                                        <option value="La Palma">La Palma</option>
                                        <option value="La Gomera">La Gomera</option>
                                        <option value="El Hierro">El Hierro</option>
                                    </>
                                }
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 3: CLASIFICACIÓN */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                        <SectionHeader 
                            icon={Tag} 
                            title="Clasificación y Contacto" 
                            colorClass="text-purple-600 dark:text-purple-400"
                            bgClass="bg-purple-100 dark:bg-purple-900/30"
                        />
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <SelectField label="Tipo Entidad" name="tipo_entidad"
                                options={
                                    <>
                                        <option value="">Seleccionar Tipo...</option>
                                        {Object.values(TIPOS_ENTIDAD).map((type) => (
                                            <option key={type} value={type}>
                                                {formatLabel(type)}
                                            </option>
                                        ))}
                                    </>
                                }
                            />

                            <SelectField label="Sub-tipo / Sector" name="sub_tipo_entidad"
                                disabled={!formData.tipo_entidad}
                                options={
                                    <>
                                        <option value="">Seleccionar Subtipo...</option>
                                        {availableSubtypes.map((subType) => (
                                            <option key={subType} value={subType}>
                                                {formatLabel(subType)}
                                            </option>
                                        ))}
                                    </>
                                }
                            />

                            <div className="md:col-span-2 my-2 border-t border-gray-100 dark:border-gray-700"></div>

                            <InputField 
                                label="Nombres Contacto (Sep. por comas)" 
                                name="nombres_org" 
                                icon={User}
                                placeholder="Ej: Juan Pérez"
                            />
                            
                            <InputField 
                                label="Rol / Cargo Principal" 
                                name="rol" 
                                icon={Briefcase}
                                placeholder="Ej: Director"
                            />

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                    Intereses / Temas (Separados por comas)
                                </label>
                                <textarea
                                    name="intereses"
                                    value={formData.intereses || ""}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Ej: economia, turismo..."
                                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-3 px-4 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactEditor;