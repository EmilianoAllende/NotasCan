import { useState, useCallback, useEffect } from "react";
import apiClient from "../api/apiClient";

export const useCampaignsAndTemplates = (setNotification, isAuthenticated) => { // <-- Recibimos isAuthenticated
	const [selectedCampaignId, setSelectedCampaignId] = useState(null);
	const [campaignTemplates, setCampaignTemplates] = useState([]);
	const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

	// Lógica de Carga de Plantillas (API)
	// --- Carga de Plantillas con Parseo Seguro ---
	const fetchTemplates = useCallback(async () => {
		setIsLoadingTemplates(true);
		try {
			const response = await apiClient.getTemplates();

			if (Array.isArray(response.data)) {
				const mappedTemplates = response.data.map(template => {
                    // 1. Intentar parsear builder_config si es un string
                    let parsedBuilder = template.builder_config;
                    if (typeof parsedBuilder === 'string') {
                        try {
                            parsedBuilder = JSON.parse(parsedBuilder);
                        } catch (e) {
                            console.warn("Error al parsear builder_config:", e);
                            parsedBuilder = {}; // Fallback seguro
                        }
                    }
                    
                    // 2. Asegurar que sea un objeto válido si es null
                    parsedBuilder = parsedBuilder || { campaignType: '', instructions: '', examplesGood: '', examplesBad: '', useMetadata: true };

					return {
						...template,
						builder: parsedBuilder, 
						id: template.id,
						title: template.title || '',
						description: template.description || '',
						mode: template.mode || 'builder',
						rawPrompt: template.rawPrompt || '',
					};
				});

				setCampaignTemplates(mappedTemplates);

			} else {
                // ... (Manejo de error si no es array)
				console.error("Error: la API de plantillas no devolvió un array.", response.data);
				setCampaignTemplates([]); 
                // ...
			}
		} catch (err) {
            // ... (Manejo de error de red)
			console.error("Error al cargar plantillas:", err);
			setCampaignTemplates([]); 
            // ...
		} finally {
			setIsLoadingTemplates(false);
		}
	}, []);

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

    // Cargar plantillas automáticamente al iniciar
    useEffect(() => {
        if (isAuthenticated) {
            fetchTemplates();
        }
    }, [isAuthenticated, fetchTemplates]);
// -----------------------------------

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
