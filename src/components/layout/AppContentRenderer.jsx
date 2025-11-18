/* eslint-disable no-unused-vars */
// src/components/layout/AppContentRenderer.jsx
import React from "react";

// Importaciones de las vistas
import Dashboard from "../layout/Dashboard";
import OrganizationList from "../organization/OrganizationList";
import OrganizationDetail from "../organization/OrganizationDetail";
import Campaigns from "../campaigns/Campaigns";
import ContactEditor from "../editor-tabs/ContactEditor";
import UserAdmin from "../users/UserAdmin";

const AppContentRenderer = (props) => {
	// Desestructuración de las props para el renderizado
	const {
		activeView,
		setActiveView,
		organizaciones,
		lastRefreshTs,
		handleRefresh,
		isLoading,
		error,
		isSaving,
		setNotification,
		setConfirmProps,
		closeConfirm,
		filterStatus,
		setFilterStatus,
		filterType,
		setFilterType,
		filterIsla,
		setFilterIsla,
		filterSuscripcion,
		setFilterSuscripcion,
		currentPage,
		setCurrentPage,
		openEditor,
		viewDetail,
		handleOpenCampaignModal,
		saveContact,
		selectedOrg,
		campaignTemplates,
		selectedCampaignId,
		setSelectedCampaignId,
		startCallCenterMode,
		metricas,
		estadosData,
		islasData,
		sectoresData,
		currentUser,
	} = props;

	switch (activeView) {
		case "dashboard":
			return (
				<Dashboard
					metricas={metricas}
					estadosData={estadosData}
					islasData={islasData}
					sectoresData={sectoresData}
				/>
			);
		case "listado":
			return (
				<OrganizationList {...props} />
			);
		case "detalle":
			return (
				<OrganizationDetail
					selectedOrg={selectedOrg}
					openEditModal={openEditor}
					setShowCampaignModal={() => handleOpenCampaignModal(selectedOrg)}
					selectedCampaignId={selectedCampaignId}
					setNotification={setNotification}
					onSelectCampaignRequired={() => {
						setNotification({
							type: "warning",
							title: "Campaña Requerida",
							message:
								"Por favor, selecciona una campaña en el listado antes de enviar un email.",
						});
					}}
				/>
			);
		case "editor":
			return (
				<ContactEditor
					selectedOrg={selectedOrg}
					onSave={saveContact}
					onCancel={() => setActiveView("listado")}
					isSaving={isSaving}
					setConfirmProps={setConfirmProps}
					closeConfirm={closeConfirm}
				/>
			);
		case "campanas":
			return (
				<Campaigns {...props} />
			);
		case "admin":
			return (
				<UserAdmin
					currentUser={currentUser}
					setNotification={setNotification}
					setConfirmProps={setConfirmProps}
					closeConfirm={closeConfirm}
				/>
			);
		default:
			return (
				<div className="flex items-center justify-center h-full">
					<div className="p-8 text-center text-slate-500 dark:text-slate-400">
						<p>Por favor, selecciona una vista.</p>
					</div>
				</div>
			);
	}
};

export default AppContentRenderer;
