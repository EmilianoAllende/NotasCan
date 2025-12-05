/* eslint-disable no-unused-vars */
import React, { useCallback } from "react";

import Dashboard from "./Dashboard"; 
import OrganizationList from "../organization/OrganizationList";
import OrganizationDetail from "../organization/OrganizationDetail";
import Campaigns from "../campaigns/Campaigns";
import ContactEditor from "../editor-tabs/ContactEditor";
import UserAdmin from "../users/UserAdmin";
import CampaignHistory from "../campaigns/CampaignHistory";

const AppContentRenderer = (props) => {
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
		setSelectedOrg,
		campaignTemplates,
		handleSaveTemplate,
		handleDeleteTemplate,
		handleAddTemplate,
		selectedCampaignId,
		setSelectedCampaignId,
		startCallCenterMode,
		campanasActivas,
		metricas,
		estadosData,
		islasData,
		sectoresData,
		currentUser,
	} = props;

	const handleBack = useCallback(() => {
		setSelectedOrg(null);
		setActiveView("listado");
	}, [setSelectedOrg, setActiveView]);

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
			return <OrganizationList {...props} />;
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
					onBack={handleBack} 
				/>
			);
		case "editor":
			return (
				<ContactEditor
					selectedOrg={selectedOrg}
					onSave={saveContact}
					onCancel={handleBack}
					isSaving={isSaving}
					setConfirmProps={setConfirmProps}
					closeConfirm={closeConfirm}
					onBack={handleBack}
				/>
			);
		case "campanas":
			return (
				<Campaigns
					campaignTemplates={campaignTemplates}
					onSelectTemplateForSend={setSelectedCampaignId}
					setConfirmProps={setConfirmProps}
					closeConfirm={closeConfirm}
					onSaveTemplate={handleSaveTemplate}
					onDeleteTemplate={handleDeleteTemplate}
					onAddTemplate={handleAddTemplate}
				/>
			);
		case "historial":
			return (
				<CampaignHistory
					campanasActivas={campanasActivas}
					organizaciones={organizaciones}
					campaignTemplates={campaignTemplates}
					historyData={props.historyData}
					isLoading={props.isHistoryLoading}
					onRefresh={props.refreshHistory}
				/>
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
				<div className="flex items-center justify-center h-full p-3">
					<div className="p-8 text-center text-slate-500 dark:text-slate-400">
						<p>Por favor, selecciona una vista.</p>
					</div>
				</div>
			);
	}
};

export default AppContentRenderer;