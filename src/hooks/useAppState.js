// src/hooks/useAppState.js
// eslint-disable-next-line no-unused-vars
import React, { useMemo, useEffect } from "react";
// Hooks Modulares
import { useAuth } from "./useAuth";
import { useUI } from "./useUI";
import { useCampaignsAndTemplates } from "./useCampaignsAndTemplates";
import { useOrganizationData } from "./useOrganizationData";
import { useCallCenterAndCampaignFlow } from "./useCallCenterAndCampaignFlow";
import { useDashboardData } from "./useDashboardData";
import { useDataHandlers } from "./useDataHandlers";

export const useAppState = () => {
	// 1. Inicializar Hooks Modulares
	const auth = useAuth();
	const ui = useUI(auth.setCurrentUser, auth.setIsAuthenticated);
	const orgData = useOrganizationData(auth.isAuthenticated);
	const campaigns = useCampaignsAndTemplates(
		ui.setNotification,
		auth.isAuthenticated
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
		...orgData,
		...campaigns,
	});

	return {
		...auth,
		...ui,
		...orgData,
		...campaigns,
		...campaignFlow,
		...dataHandlers,
		metricas,
		estadosData,
		islasData,
		sectoresData,
	};
};
