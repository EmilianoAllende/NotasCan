// Hooks Modulares
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
	// 1. Inicializar Hooks Modulares
	const auth = useAuth();
	const ui = useUI(auth.setCurrentUser, auth.setIsAuthenticated);
	const orgData = useOrganizationData(auth.isAuthenticated);
	const campaigns = useCampaignsAndTemplates(
		ui.setNotification,
		auth.isAuthenticated
	);
	const [historyData, setHistoryData] = useState(null); // null indica que aun no se cargó
	const [isHistoryLoading, setIsHistoryLoading] = useState(false);
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
	const campaignFlow = useCallCenterAndCampaignFlow({
		...auth,
		...ui,
		...orgData,
		...campaigns,
	});

	// --- 3. AHORA SÍ, INICIALIZAMOS NAVIGATION HANDLERS ---
	const navigationHandlers = useNavigationHandlers(
		ui.setActiveView,
		ui.setSelectedOrg,
		campaignFlow.setEmailPreview, // Extraído de campaignFlow
		campaignFlow.setCurrentTask, // Extraído de campaignFlow
		campaignFlow.setIsCallCenterMode, // Extraído de campaignFlow
		ui.setShowCampaignModal // Extraído de ui
	);

	return {
		...auth,
		...ui,
		...orgData,
		...campaigns,
		...campaignFlow,
		...dataHandlers,
		// --- 4. EXPORTAR LOS HANDLERS (incluyendo openCampaign) ---
		...navigationHandlers,
		metricas,
		estadosData,
		historyData,
		isHistoryLoading,
		refreshHistory,
		islasData,
		sectoresData,
	};
};
