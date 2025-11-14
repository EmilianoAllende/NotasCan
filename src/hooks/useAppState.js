// src/hooks/useAppState.js
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
	// Lógica de plantillas depende de las notificaciones de UI
	const campaigns = useCampaignsAndTemplates(ui.setNotification);

	// Lógica de datos de organizaciones depende de la autenticación y coordina la actualización de plantillas
	const orgData = useOrganizationData(
		auth.isAuthenticated,
		ui.setNotification,
		campaigns.fetchTemplates
	);

	// Lógica de flujo de negocio (el más complejo) depende de muchos estados cruzados
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

	// Dashboard Data (Depende directamente de las organizaciones)
	const { metricas, estadosData, islasData, sectoresData } = useDashboardData(
		orgData.organizaciones
	);

	// Data Handlers (Mantenidos y actualizados para usar el setter de orgData)
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

	// Handlers de Navegación que usan el helper setViewAndOrg de useUI
	const { openEditor, viewDetail } = useMemo(
		() => ({
			openEditor: (org) => {
				ui.setViewAndOrg("editor", org);
			},
			viewDetail: (org) => {
				ui.setViewAndOrg("detalle", org);
			},
		}),
		[ui.setViewAndOrg]
	);

	// Auth Handlers coordinados con la UI (para cambiar la vista después del login/logout)
	const handleLoginSuccess = (userData) => {
		auth.handleLoginSuccess(userData);
		ui.setActiveView("listado");
	};
	const handleLogout = () => {
		auth.handleLogout();
		ui.setActiveView("listado");
	};

	// Handler para abrir el modal de campaña que limpia estados específicos del flujo
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
		isPreviewLoading: workflow.isPreviewLoading,
		isSendingCampaign: workflow.isSendingCampaign,
		isCallCenterMode: workflow.isCallCenterMode,
		isTaskLoading: workflow.isTaskLoading,
		currentTask: workflow.currentTask,
		handleGeneratePreview: workflow.handleGeneratePreview,
		handleConfirmAndSend: workflow.handleConfirmAndSend,
		startCallCenterMode: workflow.startCallCenterMode,
		_executeStartCallCenterMode: workflow._executeStartCallCenterMode,
		handleOpenCampaignModal, // El handler coordinado

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
