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
		...dataHandlers,
		// 4. Exportar los handlers
		...navigationHandlers,
		metricas,
		estadosData,
		islasData,
		sectoresData,
		// Alias explícito para seguridad (aunque ...orgData ya lo incluye)
		onRefresh: orgData.handleRefresh,
	};
};