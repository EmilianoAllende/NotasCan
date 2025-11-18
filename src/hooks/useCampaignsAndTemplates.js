// src/hooks/useCampaignsAndTemplates.js
import { useState, useCallback } from "react";
import apiClient from "../api/apiClient"; // Asegúrate de que este archivo exista

export const useCampaignsAndTemplates = (setNotification) => {
	const [selectedCampaignId, setSelectedCampaignId] = useState(null);
	const [campaignTemplates, setCampaignTemplates] = useState([]);
	const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

	// Lógica de Carga de Plantillas (API)
	const fetchTemplates = useCallback(async () => {
		setIsLoadingTemplates(true);
		try {
			const response = await apiClient.getTemplates();
			setCampaignTemplates(response.data);
		} catch (err) {
			console.error("Error al cargar plantillas:", err);
			setNotification({
				type: "error",
				title: "Error al Cargar Plantillas",
				message: "No se pudieron cargar las plantillas desde la base de datos.",
			});
		} finally {
			setIsLoadingTemplates(false);
		}
	}, [setNotification]);

	// Handlers para el Editor de Campañas (Guardar/Eliminar)
	const handleSaveTemplate = useCallback(
		async (templateData) => {
			try {
				await apiClient.saveTemplate(templateData);
				setNotification({
					type: "success",
					title: "Plantilla Guardada",
					message: "Los cambios se guardaron en la base de datos.",
				});
				await fetchTemplates();
			} catch (err) {
				console.error("Error al guardar plantilla:", err);
				setNotification({
					type: "error",
					title: "Error al Guardar",
					message: "No se pudo guardar la plantilla.",
				});
			}
		},
		[fetchTemplates, setNotification]
	);

	const handleDeleteTemplate = useCallback(
		async (templateId) => {
			try {
				await apiClient.deleteTemplate(templateId);
				setNotification({
					type: "success",
					title: "Plantilla Eliminada",
					message: "La plantilla fue eliminada.",
				});
				await fetchTemplates();
			} catch (err) {
				console.error("Error al eliminar plantilla:", err);
				setNotification({
					type: "error",
					title: "Error al Eliminar",
					message: "No se pudo eliminar la plantilla.",
				});
			}
		},
		[fetchTemplates, setNotification]
	);

	return {
		campaignTemplates,
		isLoadingTemplates,
		selectedCampaignId,
		setSelectedCampaignId,
		fetchTemplates,
		handleSaveTemplate,
		handleDeleteTemplate,
	};
};
