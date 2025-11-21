import React from "react";
import OrganizationFilters from "./OrganizationFilters";
import OrganizationTable from "./OrganizationTable";

// Importaciones de utilidades y componentes movidos
import { ESTADOS_CLIENTE } from "../../utils/organizationUtils";
import Pagination from "../shared/Pagination";
import { useOrganizationList } from "../../hooks/useOrganizationList"; // Importamos el nuevo Hook

const OrganizationList = (props) => {
	// 1. Llamamos al hook y le pasamos *todas* las props que recibe
	const {
		searchTerm,
		setSearchTerm,
		selectedOrgIds,
		setSelectedOrgIds,
		selectedOrg,
		setSelectedOrg,
		lastRefreshLabel,
		ITEMS_PER_PAGE,
		filteredOrgs,
		totalPages,
		getSelectedOrgs,
		isCallCenterDisabled,
		handleCampaignClick,
		handleClearFilters,
		isClean,
		SubFilterType,
		setFilterSubType,
		isLoading,
	} = useOrganizationList(props);

	// 2. Desestructuramos las props que el hook NO maneja, pero que el JSX SÍ necesita
	const {
		openEditModal,
		viewDetail,
		currentPage,
		setCurrentPage,
		onRefresh,
		startCallCenterMode,
		campaignTemplates,
		selectedCampaignId,
		setSelectedCampaignId,
		filterStatus,
		setFilterStatus,
		filterType,
		setFilterType,
		filterIsla,
		setFilterIsla,
		filterSuscripcion,
		setFilterSuscripcion,
	} = props;

	// 3. El JSX es solo layout y paso de props
	return (
		<div className="max-w-full mx-auto p-3 sm:px-6 lg:px-8 transition-colors duration-300">
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

				<div className="p-3 border-b border-gray-100 dark:border-gray-800">
					<OrganizationFilters
						filterStatus={filterStatus}
						setFilterStatus={setFilterStatus}
						filterType={filterType}
						SubFilterType={SubFilterType}
						setFilterType={setFilterType}
						setFilterSubType={setFilterSubType}
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
						totalOrgsLength={props.organizaciones.length} // Pasamos el total original
						lastRefreshLabel={lastRefreshLabel}
						ESTADOS_CLIENTE={ESTADOS_CLIENTE}
					/>
				</div>

				<div className="p-2">
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
							</span>
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
