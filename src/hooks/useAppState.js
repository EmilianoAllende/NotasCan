/* eslint-disable no-unused-vars */
import React from "react";

import { useAuth } from "./useAuth";
import { useUI } from "./useUI";
import { useCampaignsAndTemplates } from "./useCampaignsAndTemplates";
import { useOrganizationData } from "./useOrganizationData";
import { useCallCenterAndCampaignFlow } from "./useCallCenterAndCampaignFlow";
import { useDashboardData } from "./useDashboardData";
import { useDataHandlers } from "./useDataHandlers";
import { useNavigationHandlers } from "./useNavigationHandlers";
import { useState } from "react";
import apiClient from "../api/apiClient";
export const useAppState = () => {
	// 1. Inicializar Hooks Modulares (EN EL ORDEN CORRECTO)
	const auth = useAuth();
	const ui = useUI(auth.setCurrentUser, auth.setIsAuthenticated);

	// --- CAMBIO DE ORDEN: Campaigns va PRIMERO ---
	// Necesitamos 'fetchTemplates' para pasárselo a 'orgData'
	const campaigns = useCampaignsAndTemplates(
		ui.setNotification,
		auth.isAuthenticated
	);
	const [historyData, setHistoryData] = useState(null); // null indica que aun no se cargó
	const [isHistoryLoading, setIsHistoryLoading] = useState(false);
	// --- CAMBIO DE ARGUMENTOS: Pasamos lo que faltaba ---
	const orgData = useOrganizationData(
		auth.isAuthenticated,
		ui.setNotification, // <-- FALTABA
		campaigns.fetchTemplates // <-- FALTABA (Vital para handleRefresh)
	);

	// 2. Hooks que dependen de otros hooks
	const { metricas, estadosData, islasData, sectoresData } = useDashboardData(
		orgData.organizaciones
	);

	const dataHandlers = useDataHandlers(
		ui.setNotification,
		ui.setActiveView,
		orgData.handleRefresh
	);
	const refreshHistory = async () => {
		if (isHistoryLoading) return;
		setIsHistoryLoading(true);
		try {
			const res = await apiClient.getCampaignsHistory();
			setHistoryData(res.data);
		} catch (error) {
			console.error("Error cargando historial:", error);
			// Opcional: manejar error global
		} finally {
			setIsHistoryLoading(false);
		}
	};

	const saveContact = async (formData) => {
		if (orgData.setIsSaving) orgData.setIsSaving(true);
		try {
			await apiClient.updateOrganization(formData);
			// Actualización optimista del estado local
			if (orgData.setOrganizaciones) {
				orgData.setOrganizaciones((prev) =>
					prev.map((org) =>
						org.id === formData.id ? { ...org, ...formData } : org
					)
				);
			}
			ui.setNotification({
				type: "success",
				message: "Organización guardada correctamente.",
			});
			ui.setActiveView("listado");
		} catch (error) {
			console.error("Error saving contact:", error);
			ui.setNotification({ type: "error", message: "Error al guardar." });
		} finally {
			if (orgData.setIsSaving) orgData.setIsSaving(false);
		}
	};

	const campaignFlow = useCallCenterAndCampaignFlow({
		...auth,
		...ui,
		...orgData, // Ahora orgData.handleRefresh funciona bien
		...campaigns,
	});

	// 3. Inicializamos Navigation Handlers
	const navigationHandlers = useNavigationHandlers(
		ui.setActiveView,
		ui.setSelectedOrg,
		campaignFlow.setEmailPreview,
		campaignFlow.setCurrentTask,
		campaignFlow.setIsCallCenterMode,
		ui.setShowCampaignModal
	);

	return {
		...auth,
		...ui,
		...orgData,
		...campaigns,
		...campaignFlow,
		handleSkipTask: campaignFlow.handleSkipTask,
		handleOpenCampaignModal: campaignFlow.handleOpenCampaignModal,
		...navigationHandlers,
		metricas,
		estadosData,
		historyData,
		isHistoryLoading,
		refreshHistory,
		islasData,
		sectoresData,
		onRefresh: orgData.handleRefresh,
		saveContact,
	};
};