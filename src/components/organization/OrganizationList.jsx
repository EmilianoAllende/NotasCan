import React, { useState, useMemo, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { RefreshCw, Search } from "lucide-react";
import OrganizationFilters from "./OrganizationFilters";
import OrganizationTable from "./OrganizationTable";
const ESTADOS_CLIENTE = {
	PENDIENTE: 0,
	EN_REVISION: 1,
	COMPLETADO: 2,
};
const getEntityType = (org) => {
	if (org.es_publica) return "Administración Pública";
	if (org.es_asociacion) return "Asociación";
	return "Empresa";
};
const getElapsedString = (timestamp) => {
	if (!timestamp) return "Nunca";
	const now = new Date();
	const past = new Date(timestamp);
	const diffInMinutes = Math.floor((now - past) / (1000 * 60));
	if (diffInMinutes < 60) return `hace ${diffInMinutes} minutos`;
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `hace ${diffInHours} horas`;
	const diffInDays = Math.floor(diffInHours / 24);
	return `hace ${diffInDays} días`;
};
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const pageNumbers = [];
	const maxVisiblePages = 5;
	let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
	let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
	if (endPage - startPage + 1 < maxVisiblePages)
		startPage = Math.max(1, endPage - maxVisiblePages + 1);
	for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
	return (
		<nav className="flex items-center space-x-1">
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="px-3 py-2 text-sm font-medium rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition">
				Anterior
			</button>
			{startPage > 1 && <span className="px-2 text-gray-400">...</span>}
			{pageNumbers.map((number) => (
				<button
					key={number}
					onClick={() => onPageChange(number)}
					className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-full transition ${
						number === currentPage
							? "bg-blue-600 text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
							: "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
					}`}>
					{number}
				</button>
			))}
			{endPage < totalPages && <span className="px-2 text-gray-400">...</span>}
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages || totalPages === 0}
				className="px-3 py-2 text-sm font-medium rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition">
				Siguiente
			</button>
		</nav>
	);
};
const OrganizationList = (props) => {
	const {
		organizaciones,
		filterStatus,
		setFilterStatus,
		filterType,
		setFilterType,
		filterIsla,
		setFilterIsla,
		filterSuscripcion,
		setFilterSuscripcion,
		lastRefreshTs,
		openEditModal,
		viewDetail,
		openCampaign,
		currentPage,
		setCurrentPage,
		onRefresh,
		startCallCenterMode,
		campaignTemplates,
		selectedCampaignId,
		setSelectedCampaignId,
		setConfirmProps,
		closeConfirm,
		// eslint-disable-next-line no-unused-vars
		setNotification,
	} = props;
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedOrgIds, setSelectedOrgIds] = useState(new Set());
	const [selectedOrg, setSelectedOrg] = useState(null);
	const [lastRefreshLabel, setLastRefreshLabel] = useState("");
	const ITEMS_PER_PAGE = 25;
	useEffect(() => {
		if (!lastRefreshTs) return setLastRefreshLabel("");
		const update = () => setLastRefreshLabel(getElapsedString(lastRefreshTs));
		update();
		const id = setInterval(update, 60000);
		return () => clearInterval(id);
	}, [lastRefreshTs]);
	const filteredOrgs = useMemo(() => {
		const lower = searchTerm.toLowerCase();
		return organizaciones.filter((org) => {
			const matchesSearch =
				lower === "" ||
				(org.organizacion || "").toLowerCase().includes(lower) ||
				(org.nombre || "").toLowerCase().includes(lower) ||
				(org.id || "").toLowerCase().includes(lower) ||
				(org.nombres_org || "").toLowerCase().includes(lower);
			const tipoEntidad = getEntityType(org);
			const matchesStatus =
				filterStatus === "todos" ? true : org.estado_cliente === filterStatus;
			const matchesType =
				filterType === "todos" ? true : tipoEntidad === filterType;
			const matchesIsla =
				filterIsla === "todos" ? true : org.isla === filterIsla;
			const matchesSuscripcion =
				filterSuscripcion === "todos"
					? true
					: org.suscripcion === filterSuscripcion;
			return (
				matchesSearch &&
				matchesStatus &&
				matchesType &&
				matchesIsla &&
				matchesSuscripcion
			);
		});
	}, [
		organizaciones,
		searchTerm,
		filterStatus,
		filterType,
		filterIsla,
		filterSuscripcion,
	]);
	const totalPages = Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE);
	const getSelectedOrgs = () =>
		organizaciones.filter((org) => selectedOrgIds.has(org.id));
	const isCallCenterDisabled = selectedOrgIds.size < 2 || !selectedCampaignId;
	const handleCampaignClick = (org) => {
		const templateName =
			campaignTemplates.find((t) => t.id === selectedCampaignId)?.title ||
			"la campaña seleccionada";
		setConfirmProps({
			show: true,
			title: "Confirmar Envío Individual",
			message: `¿Quieres generar un borrador para "${
				org.organizacion || org.id
			}" usando la plantilla "${templateName}"?`,
			confirmText: "Sí, generar",
			cancelText: "No, volver",
			type: "info",
			onConfirm: () => {
				openCampaign(org);
				closeConfirm();
			},
		});
	};
	useEffect(() => {
		setCurrentPage(1);
		setSelectedOrgIds(new Set());
	}, [
		searchTerm,
		filterStatus,
		filterType,
		filterIsla,
		filterSuscripcion,
		setCurrentPage,
	]);
	useEffect(() => setSelectedOrgIds(new Set()), [currentPage]);
	const handleClearFilters = () => {
		setSearchTerm("");
		setFilterStatus("todos");
		setFilterType("todos");
		setFilterIsla("todos");
		setFilterSuscripcion("todos");
		setCurrentPage(1);
		setSelectedOrgIds(new Set());
		setSelectedCampaignId(null);
	};
	const isClean =
		searchTerm === "" &&
		filterStatus === "todos" &&
		filterType === "todos" &&
		filterIsla === "todos" &&
		filterSuscripcion === "todos" &&
		(selectedCampaignId === null || selectedCampaignId === "");
	const isLoading = organizaciones.length === 0;
	return (
		<div className="max-w-full mx-auto  sm:px-6 lg:px-8 transition-colors duration-300">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10 overflow-hidden">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60 backdrop-blur-md">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
							Gestor de Organizaciones
						</h1>
						<p className="mt-1 text-base text-gray-500 dark:text-gray-400">
							Gestión centralizada de clientes, leads y campañas activas.
						</p>
					</div>
				</div>
				<div className="p-6 border-b border-gray-100 dark:border-gray-800">
					<OrganizationFilters
						filterStatus={filterStatus}
						setFilterStatus={setFilterStatus}
						filterType={filterType}
						setFilterType={setFilterType}
						filterIsla={filterIsla}
						setFilterIsla={setFilterIsla}
						filterSuscripcion={filterSuscripcion}
						setFilterSuscripcion={setFilterSuscripcion}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
						selectedCampaignId={selectedCampaignId}
						setSelectedCampaignId={setSelectedCampaignId}
						handleClearFilters={handleClearFilters}
						isClean={isClean}
						onRefresh={onRefresh}
						isLoading={isLoading}
						startCallCenterMode={startCallCenterMode}
						getSelectedOrgs={getSelectedOrgs}
						isCallCenterDisabled={isCallCenterDisabled}
						campaignTemplates={campaignTemplates}
						filteredOrgsLength={filteredOrgs.length}
						totalOrgsLength={organizaciones.length}
						lastRefreshLabel={lastRefreshLabel}
						ESTADOS_CLIENTE={ESTADOS_CLIENTE}
					/>
				</div>

				<div className="p-6">
					<OrganizationTable
						filteredOrgs={filteredOrgs}
						currentPage={currentPage}
						ITEMS_PER_PAGE={ITEMS_PER_PAGE}
						selectedOrgIds={selectedOrgIds}
						setSelectedOrgIds={setSelectedOrgIds}
						selectedOrg={selectedOrg}
						setSelectedOrg={setSelectedOrg}
						viewDetail={viewDetail}
						openEditModal={openEditModal}
						handleCampaignClick={handleCampaignClick}
						ESTADOS_CLIENTE={ESTADOS_CLIENTE}
						isLoading={isLoading}
					/>

					<div className="mt-6 flex items-center justify-between py-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
						<span>
							Mostrando{" "}
							<span className="font-semibold text-gray-900 dark:text-gray-100">
								{filteredOrgs.length > 0
									? (currentPage - 1) * ITEMS_PER_PAGE + 1
									: 0}
							</span>
							-
							<span className="font-semibold text-gray-900 dark:text-gray-100">
								{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrgs.length)}
							</span>{" "}
							de{" "}
							<span className="font-semibold text-gray-900 dark:text-gray-100">
								{filteredOrgs.length}
							</span>{" "}
							organizaciones
							<span className="ml-2 py-0.5 px-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium rounded-full text-xs">
								{selectedOrgIds.size} seleccionada
								{selectedOrgIds.size !== 1 ? "s" : ""}
							</span>
						</span>
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrganizationList;