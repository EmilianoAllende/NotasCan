// src/hooks/useDataHandlers.js
import { useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";
// eslint-disable-next-line no-unused-vars
const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000;

export const useDataHandlers = (
	isAuthenticated,
	organizaciones,
	setOrganizaciones,
	setLastRefreshTs,
	setIsLoading,
	setError,
	setIsSaving,
	setActiveView,
	setNotification
) => {
	useEffect(() => {
		if (organizaciones.length === 0 && isAuthenticated) {
			setIsLoading(true);
			const fetchOrganizaciones = async () => {
				try {
					const response = await apiClient.getOrganizaciones();
					const cache = {
						data: response.data,
						timestamp: new Date().getTime(),
					};
					localStorage.setItem("organizaciones_cache", JSON.stringify(cache));
					setOrganizaciones(response.data);
					setLastRefreshTs(cache.timestamp);
				} catch (err) {
					setError(err);
				} finally {
					setIsLoading(false);
				}
			};
			fetchOrganizaciones();
		}
	}, [
		organizaciones.length,
		isAuthenticated,
		setOrganizaciones,
		setLastRefreshTs,
		setIsLoading,
		setError,
	]);
	// Handler para refrescar
	const handleRefresh = useCallback(() => {
		localStorage.removeItem("organizaciones_cache");
		setOrganizaciones([]);
		// setCurrentPage(1); // Esto pertenece a UI, se maneja en el componente
		setLastRefreshTs(null);
	}, [setOrganizaciones, setLastRefreshTs]);
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
				handleRefresh(); // Reutiliza el handler de refresco
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
		[handleRefresh, setActiveView, setError, setIsSaving, setNotification]
	);

	return {
		handleRefresh,
		saveContact,
	};
};
