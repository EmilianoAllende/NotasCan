// src/hooks/useNavigationHandlers.js
import { useCallback } from "react";

/**
 * Hook para manejar la navegación entre vistas y la apertura de modales.
 */
export const useNavigationHandlers = (
	setActiveView,
	setSelectedOrg,
	setEmailPreview,
	setCurrentTask,
	setIsCallCenterMode,
	setShowCampaignModal
) => {
	const openEditor = useCallback(
		(org) => {
			setSelectedOrg(org);
			setActiveView("editor");
		},
		[setSelectedOrg, setActiveView]
	);

	const viewDetail = useCallback(
		(org) => {
			setSelectedOrg(org);
			setActiveView("detalle");
		},
		[setSelectedOrg, setActiveView]
	);

	const handleOpenCampaignModal = useCallback(
		(org) => {
			setSelectedOrg(org);
			setEmailPreview(null);
			setCurrentTask(null);
			setIsCallCenterMode(false);
			setShowCampaignModal(true);
		},
		[
			setSelectedOrg,
			setEmailPreview,
			setCurrentTask,
			setIsCallCenterMode,
			setShowCampaignModal,
		]
	);

	return {
		openEditor,
		viewDetail,
		handleOpenCampaignModal,
	};
};
