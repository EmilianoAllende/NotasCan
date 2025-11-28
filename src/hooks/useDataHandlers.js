// src/hooks/useDataHandlers.js
import { useCallback, useState } from "react";
import apiClient from "../api/apiClient";

export const useDataHandlers = (
	setNotification, // 1. Recibido de useUI
	setActiveView,   // 2. Recibido de useUI
	handleRefresh    // 3. Recibido de useOrganizationData (¡IMPORTANTE!)
) => {
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

    // NOTA: Ya no necesitamos definir handleRefresh aquí adentro, 
    // porque lo recibimos como parámetro (argumento n° 3).

	// Handler para guardar
	const saveContact = useCallback(
		async (updatedOrg) => {
			setIsSaving(true);
			setError(null);
			
            const orgToSend = { ...updatedOrg };
			
            // Lógica de limpieza de datos
			Object.keys(orgToSend).forEach((key) => {
				const value = orgToSend[key];
				if (
					key === "telefono" &&
					(value === "" || value === null || value === undefined)
				) {
					orgToSend[key] = 0;
				} else if (typeof value === "string" && value === "") {
					orgToSend[key] = "[vacio]";
				}
			});

			try {
				await apiClient.updateOrganization(orgToSend);
				
                // AQUÍ ESTABA EL ERROR: Ahora llamamos a la función que recibimos por props
                if (typeof handleRefresh === 'function') {
				    handleRefresh(); 
                }

				setActiveView("listado");
				
                setNotification({
					type: "success",
					title: "Guardado",
					message: "Organización actualizada con éxito.",
				});
			} catch (err) {
				console.error("Error al actualizar la organización:", err);
				setNotification({
					type: "error",
					title: "Error al Guardar",
					message: "No se pudieron guardar los cambios.",
				});
				setError(err);
			} finally {
				setIsSaving(false);
			}
		},
		[handleRefresh, setActiveView, setNotification]
	);

	return {
        // No devolvemos handleRefresh porque ya existe fuera, 
        // pero devolvemos los estados locales de este hook
        isSaving,
        error,
		saveContact,
	};
};