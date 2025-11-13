// src/components/organization/OrganizationFilters.jsx

import React from "react";
import { Search, Zap, RefreshCw, RotateCcw } from "lucide-react";

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
	ESTADOS_CLIENTE,
}) => {
	return (
		<div className="grid gap-3">
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
				<select
					value={filterStatus}
					onChange={(e) =>
						setFilterStatus(
							e.target.value === "todos" ? "todos" : parseInt(e.target.value)
						)
					}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
					<option value="todos">Todos los estados</option>
					<option value={ESTADOS_CLIENTE.COMPLETADO}>Completado</option>
					<option value={ESTADOS_CLIENTE.EN_REVISION}>En revisión</option>
					<option value={ESTADOS_CLIENTE.PENDIENTE}>Pendiente</option>
				</select>
				<select
					value={filterType}
					onChange={(e) => setFilterType(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
					<option value="todos">Todos los tipos</option>
					<option value="Administración Pública">Público</option>
					<option value="Empresa">Empresa</option>
					<option value="Asociación">Asociación</option>
				</select>
				<select
					value={filterIsla}
					onChange={(e) => setFilterIsla(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
					<option value="todos">Todas las islas</option>
					{islasCanarias.map((isla) => (
						<option key={isla} value={isla}>
							{isla}
						</option>
					))}
				</select>
				<select
					value={filterSuscripcion}
					onChange={(e) => setFilterSuscripcion(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
					<option value="todos">Todas las suscripciones</option>
					<option value="activa">Activa</option>
					<option value="inactiva">Inactiva</option>
				</select>
			</div>

			<div className="flex items-center justify-between">
				<div className="relative flex-1 max-w-auto">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="text"
						className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						placeholder="Buscar organizaciones..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className="absolute inset-y-0 right-0 pr-3 flex items-center">
							<span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
								×
							</span>
						</button>
					)}
				</div>
				<div className="ml-4 w-64">
					<select
						value={selectedCampaignId || ""}
						onChange={(e) => setSelectedCampaignId(e.target.value || null)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-purple-600 dark:bg-purple-700 dark:border-gray-600 text-gray-200">
						<option value="">Seleccionar Campaña</option>
						{campaignTemplates.map((campaign) => (
							<option key={campaign.id} value={campaign.id}>
								{campaign.title}
							</option>
						))}
					</select>
				</div>

				<div className="ml-4 flex space-x-2">
					{startCallCenterMode && (
						<button
							onClick={() => startCallCenterMode(getSelectedOrgs())}
							disabled={isCallCenterDisabled}
							className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
							title={
								isCallCenterDisabled
									? "Selecciona al menos 2 organizaciones y una campaña."
									: `Iniciar Modo Call Center con ${
											getSelectedOrgs().length
									  } organizaciones`
							}>
							<Zap className="h-4 w-4" />
							Modo Call Center ({getSelectedOrgs().length})
						</button>
					)}
					<button
						onClick={handleClearFilters}
						disabled={isClean}
						className={`px-3 py-2 text-sm font-medium rounded-lg ${
							isClean
								? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
								: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
						}`}
						title="Limpiar todos los filtros">
						<RotateCcw className="h-4 w-4" />
					</button>
					<button
						onClick={onRefresh}
						className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						title="Actualizar datos">
						<RefreshCw
							className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
						/>
					</button>
				</div>
			</div>

			{!isClean && (
				<div className="text-sm text-gray-500 dark:text-gray-400">
					Mostrando {filteredOrgsLength} de {totalOrgsLength} organizaciones
					{searchTerm && ` que coinciden con "${searchTerm}"`}
					{filterStatus !== "todos" &&
						`, estado: ${
							filterStatus === ESTADOS_CLIENTE.COMPLETADO
								? "Completado"
								: filterStatus === ESTADOS_CLIENTE.EN_REVISION
								? "En revisión"
								: filterStatus === ESTADOS_CLIENTE.PENDIENTE
								? "Pendiente"
								: filterStatus
						}`}
					{filterType !== "todos" && `, tipo: ${filterType}`}
					{filterIsla !== "todos" && `, isla: ${filterIsla}`}
					{filterSuscripcion !== "todos" &&
						`, suscripción: ${filterSuscripcion}`}
					<button
						onClick={handleClearFilters}
						className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
						(Limpiar filtros)
					</button>
				</div>
			)}

			{lastRefreshLabel && (
				<div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
					Última actualización: {lastRefreshLabel}
				</div>
			)}
		</div>
	);
};

export default OrganizationFilters;
