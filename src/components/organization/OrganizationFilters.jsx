import React from "react";
import { Search, Zap, RefreshCw, RotateCcw } from "lucide-react";
import {
	SUBTIPOS_POR_ENTIDAD,
	ESTADOS_CLIENTE,
	TIPOS_ENTIDAD,
} from "../../utils/organizationUtils";

const islasCanarias = [
	"Gran Canaria",
	"Tenerife",
	"Lanzarote",
	"Fuerteventura",
	"La Palma",
	"La Gomera",
	"El Hierro",
	"Canarias",
];

const OrganizationFilters = ({
	filterStatus,
	setFilterStatus,
	filterType,
	setFilterType,
    // --- Nuevos props para sub-tipo ---
    filterSubType,
    setFilterSubType,
    // ----------------------------------
	filterIsla,
	setFilterIsla,
	filterSuscripcion,
	setFilterSuscripcion,
	searchTerm,
	setSearchTerm,
	selectedCampaignId,
	setSelectedCampaignId,
	campaignTemplates,
	handleClearFilters,
	isClean,
	onRefresh,
	isLoading,
	startCallCenterMode,
	getSelectedOrgs,
	isCallCenterDisabled,
	filteredOrgsLength,
	totalOrgsLength,
	lastRefreshLabel,
}) => {
    // Helper para formatear las etiquetas (ej: sector_publico -> Sector Publico)
    const formatLabel = (str) => {
        if (!str) return "";
        return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Obtener opciones de subtipo según el tipo seleccionado
    const subTypeOptions = SUBTIPOS_POR_ENTIDAD[filterType] || [];

	return (
		<div className="grid gap-3">
            {/* Aumentamos grid-cols a 5 para que quepa el nuevo filtro en pantallas grandes */}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
				
                {/* 1. Selector de Estado */}
				<select
					value={filterStatus}
					onChange={(e) =>
						setFilterStatus(
							e.target.value === "todos" ? "todos" : parseInt(e.target.value)
						)
					}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
					<option value="todos">Todos los estados</option>
					<option value={ESTADOS_CLIENTE.LISTA_BLANCA}>Lista Blanca (Canarias)</option>
					<option value={ESTADOS_CLIENTE.LISTA_NEGRA}>Lista Negra</option>
					<option value={ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL}>Lista Blanca Nacional</option>
					<option value={ESTADOS_CLIENTE.OTRO_TIPO}>Otro Tipo</option>
					<option value={ESTADOS_CLIENTE.COMPETENCIA}>Competencia</option>
					<option value={ESTADOS_CLIENTE.REVISION}>Revisión</option>
					<option value={ESTADOS_CLIENTE.CONTACTOS_BODY}>Contactos solo body</option>
					<option value={ESTADOS_CLIENTE.PENDIENTE}>Pendiente (Sin Clasificar)</option>
				</select>

				{/* 2. Selector de Tipo (Primer Nivel) */}
				<select
					value={filterType}
					onChange={(e) => {
                        setFilterType(e.target.value);
                        setFilterSubType("todos"); // Resetear subtipo al cambiar tipo
                    }}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
					<option value="todos">Todos los tipos</option>
					<option value={TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO}>Sector Público Canario</option>
					<option value={TIPOS_ENTIDAD.EMPRESAS}>Empresas</option>
					<option value={TIPOS_ENTIDAD.ASOCIACIONES}>Asociaciones</option>
				</select>

                {/* 3. Selector de Sub-Tipo (Segundo Nivel - Condicional) */}
                <select
                    value={filterSubType}
                    onChange={(e) => setFilterSubType(e.target.value)}
                    disabled={!filterType || filterType === "todos"} // Deshabilitado si no hay tipo
                    className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                        !filterType || filterType === "todos"
                            ? "bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed"
                            : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}>
                    <option value="todos">Todos los subtipos</option>
                    {subTypeOptions.map((subType) => (
                        <option key={subType} value={subType}>
                            {formatLabel(subType)}
                        </option>
                    ))}
                </select>

				{/* 4. Selector de Isla */}
				<select
					value={filterIsla}
					onChange={(e) => setFilterIsla(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
					<option value="todos">Todas las islas</option>
					{islasCanarias.map((isla) => (
						<option key={isla} value={isla}>
							{isla}
						</option>
					))}
				</select>

				{/* 5. Selector de Suscripción */}
				<select
					value={filterSuscripcion}
					onChange={(e) => setFilterSuscripcion(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
					<option value="todos">Todas las suscripciones</option>
					<option value="activa">Activa</option>
					<option value="inactiva">Inactiva</option>
				</select>
			</div>

            {/* ... (Resto del componente: Barra de búsqueda, Campaña, Botones) ... */}
            {/* ... Mismo código que antes para la barra de búsqueda y botones ... */}
			<div className="flex items-center justify-between gap-4">
				<div className="relative flex-1 min-w-0">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="text"
						className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500"
						placeholder="Buscar organizaciones..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className="absolute inset-y-0 right-0 pr-3 flex items-center group">
							<span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
								×
							</span>
						</button>
					)}
				</div>

				<div className="w-64 flex-shrink-0">
					<select
						value={selectedCampaignId || ""}
						onChange={(e) => setSelectedCampaignId(e.target.value || null)}
						className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
							selectedCampaignId
								? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-500"
								: "border-gray-300 dark:border-gray-600"
						}`}>
						<option value="">Seleccionar Campaña</option>
						{campaignTemplates.map((campaign) => (
							<option key={campaign.id} value={campaign.id}>
								{campaign.title}
							</option>
						))}
					</select>
				</div>

				<div className="flex items-center gap-2 flex-shrink-0">
					{startCallCenterMode && (
						<button
							onClick={() => startCallCenterMode(getSelectedOrgs())}
							disabled={isCallCenterDisabled || !selectedCampaignId}
							className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
							title={
								isCallCenterDisabled
									? "Selecciona al menos 2 organizaciones para continuar."
									: !selectedCampaignId
									? "Debes seleccionar una campaña primero"
									: `Iniciar Modo Call Center con ${getSelectedOrgs().length} organizaciones`
							}>
							<Zap className="h-4 w-4" />
							Modo Call Center ({getSelectedOrgs().length})
						</button>
					)}
					<button
						onClick={handleClearFilters}
						disabled={isClean}
						className={`p-2 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
							isClean
								? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700"
								: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
						}`}
						title="Limpiar todos los filtros">
						<RotateCcw className="h-5 w-5" />
					</button>
					<button
						onClick={onRefresh}
						className="p-2 text-sm font-medium text-white bg-blue-600 rounded-lg border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
						title="Actualizar datos">
						<RefreshCw
							className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
						/>
					</button>
				</div>
			</div>

			{!isClean && (
				<div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 flex-wrap gap-y-1">
					<span className="mr-1">
						Mostrando {filteredOrgsLength} de {totalOrgsLength} organizaciones
					</span>
					{searchTerm && (
						<span className="mr-1 font-medium text-gray-700 dark:text-gray-300">
							que coinciden con "{searchTerm}"
						</span>
					)}
					{/* --- Lógica de visualización actualizada --- */}
					{filterStatus !== "todos" && (
						<span className="mr-1">
							, estado:{" "}
							<span className="font-medium text-gray-700 dark:text-gray-300">
								{filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA
									? "Lista Blanca"
									: filterStatus === ESTADOS_CLIENTE.LISTA_NEGRA
									? "Lista Negra"
									: filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL
                                    ? "Lista Blanca Nacional"
                                    : filterStatus === ESTADOS_CLIENTE.OTRO_TIPO
                                    ? "Otro Tipo"
                                    : filterStatus === ESTADOS_CLIENTE.COMPETENCIA
                                    ? "Competencia"
                                    : filterStatus === ESTADOS_CLIENTE.REVISION
                                    ? "Revisión"
                                    : filterStatus === ESTADOS_CLIENTE.CONTACTOS_BODY
                                    ? "Contactos solo body"
                                    : filterStatus === ESTADOS_CLIENTE.PENDIENTE
                                    ? "Pendiente"
                                    : filterStatus}
							</span>
						</span>
					)}
					{filterType !== "todos" && (
						<span className="mr-1">
							, tipo:{" "}
							<span className="font-medium text-gray-700 dark:text-gray-300">
								{formatLabel(filterType)}
							</span>
						</span>
					)}
                    {/* --- Mostrar sub-tipo seleccionado en el resumen --- */}
                    {filterSubType && filterSubType !== "todos" && (
						<span className="mr-1">
							, subtipo:{" "}
							<span className="font-medium text-gray-700 dark:text-gray-300">
								{formatLabel(filterSubType)}
							</span>
						</span>
					)}
					{filterIsla !== "todos" && (
						<span className="mr-1">
							, isla:{" "}
							<span className="font-medium text-gray-700 dark:text-gray-300">
								{filterIsla}
							</span>
						</span>
					)}
					{filterSuscripcion !== "todos" && (
						<span className="mr-1">
							, suscripción:{" "}
							<span className="font-medium text-gray-700 dark:text-gray-300">
								{filterSuscripcion}
							</span>
						</span>
					)}
					<button
						onClick={handleClearFilters}
						className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline decoration-transparent hover:decoration-current transition-all">
						(Limpiar filtros)
					</button>
				</div>
			)}
			{lastRefreshLabel && (
				<div className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1 italic">
					Última actualización: {lastRefreshLabel}
				</div>
			)}
		</div>
	);
};

export default OrganizationFilters;