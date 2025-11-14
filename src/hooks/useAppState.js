// src/hooks/useAppState.js
// eslint-disable-next-line no-unused-vars
import React, { useMemo } from "react";
// Hooks Modulares
import { useAuth } from "./useAuth";
import { useUI } from "./useUI";
import { useCampaignsAndTemplates } from "./useCampaignsAndTemplates";
import { useOrganizationData } from "./useOrganizationData";
import { useCallCenterAndCampaignFlow } from "./useCallCenterAndCampaignFlow";
// Otros hooks ya existentes (asumidos)
import { useDashboardData } from "./useDashboardData";
import { useDataHandlers } from "./useDataHandlers";

export const useAppState = () => {
	// 1. Inicializar Hooks Modulares
	const auth = useAuth();
	const ui = useUI();

	// 2. Dependencias Encadenadas
	const campaigns = useCampaignsAndTemplates(ui.setNotification);

	const orgData = useOrganizationData(
		auth.isAuthenticated,
		ui.setNotification,
		campaigns.fetchTemplates
	);

	const workflow = useCallCenterAndCampaignFlow(
		auth.currentUser,
		ui.selectedOrg,
		campaigns.selectedCampaignId,
		ui.setNotification,
		ui.setConfirmProps,
		ui.closeConfirm,
		ui.setShowCampaignModal,
		ui.setSelectedOrg,
		orgData.handleRefresh
	);

	// --- Lógica de Coordinación/Combinación ---

	const { metricas, estadosData, islasData, sectoresData } = useDashboardData(
		orgData.organizaciones
	);

	const { saveContact } = useDataHandlers(
		auth.isAuthenticated,
		orgData.organizaciones,
		orgData.setOrganizaciones,
		orgData.setLastRefreshTs,
		orgData.setIsLoading,
		orgData.setError,
		orgData.setIsSaving,
		ui.setActiveView,
		ui.setNotification
	);

	const { openEditor, viewDetail } = useMemo(
		() => ({
			openEditor: (org) => {
				ui.setViewAndOrg("editor", org);
			},
			viewDetail: (org) => {
				ui.setViewAndOrg("detalle", org);
			},
		}),
		[ui]
	);

	const handleLoginSuccess = (userData) => {
		auth.handleLoginSuccess(userData);
		ui.setActiveView("listado");
	};
	const handleLogout = () => {
		auth.handleLogout();
		ui.setActiveView("listado");
	};

	const handleOpenCampaignModal = (org) => {
		workflow.handleOpenCampaignModal(org);
	};

	// --- Retorno Consolidado de Todos los Estados y Acciones ---
	return {
		// Auth (useAuth)
		currentUser: auth.currentUser,
		isAuthenticated: auth.isAuthenticated,
		handleLoginSuccess,
		handleLogout,

		// UI & Filtros (useUI)
		isSidebarCollapsed: ui.isSidebarCollapsed,
		setIsSidebarCollapsed: ui.setIsSidebarCollapsed,
		activeView: ui.activeView,
		setActiveView: ui.setActiveView,
		selectedOrg: ui.selectedOrg,
		setSelectedOrg: ui.setSelectedOrg,
		showCampaignModal: ui.showCampaignModal,
		setShowCampaignModal: ui.setShowCampaignModal,
		notification: ui.notification,
		setNotification: ui.setNotification,
		confirmProps: ui.confirmProps,
		setConfirmProps: ui.setConfirmProps,
		closeConfirm: ui.closeConfirm,
		filterStatus: ui.filterStatus,
		setFilterStatus: ui.setFilterStatus,
		filterType: ui.filterType,
		setFilterType: ui.setFilterType,
		filterIsla: ui.filterIsla,
		setFilterIsla: ui.setFilterIsla,
		filterSuscripcion: ui.filterSuscripcion,
		setFilterSuscripcion: ui.setFilterSuscripcion,
		currentPage: ui.currentPage,
		setCurrentPage: ui.setCurrentPage,

		// Data (useOrganizationData)
		organizaciones: orgData.organizaciones,
		lastRefreshTs: orgData.lastRefreshTs,
		isLoading: orgData.isLoading,
		error: orgData.error,
		isSaving: orgData.isSaving,
		handleRefresh: orgData.handleRefresh,

		// Campaigns & Templates (useCampaignsAndTemplates)
		campaignTemplates: campaigns.campaignTemplates,
		isLoadingTemplates: campaigns.isLoadingTemplates,
		handleSaveTemplate: campaigns.handleSaveTemplate,
		handleDeleteTemplate: campaigns.handleDeleteTemplate,
		selectedCampaignId: campaigns.selectedCampaignId,
		setSelectedCampaignId: campaigns.setSelectedCampaignId,

		// Campaign Workflow & Call Center (useCallCenterAndCampaignFlow)
		emailPreview: workflow.emailPreview,
		setEmailPreview: workflow.setEmailPreview, // <--- ¡CORRECCIÓN APLICADA AQUÍ!
		isPreviewLoading: workflow.isPreviewLoading,
		isSendingCampaign: workflow.isSendingCampaign,
		isCallCenterMode: workflow.isCallCenterMode,
		isTaskLoading: workflow.isTaskLoading,
		currentTask: workflow.currentTask,
		handleGeneratePreview: workflow.handleGeneratePreview,
		handleConfirmAndSend: workflow.handleConfirmAndSend,
		startCallCenterMode: workflow.startCallCenterMode,
		_executeStartCallCenterMode: workflow._executeStartCallCenterMode,
		handleOpenCampaignModal,

		// Modular Data & Navigation Handlers (Existentes)
		saveContact,
		openEditor,
		viewDetail,

		// Dashboard
		metricas,
		estadosData,
		islasData,
		sectoresData,
	};
};
