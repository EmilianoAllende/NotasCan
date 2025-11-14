// src/hooks/useOrganizationData.js
import { useState, useCallback, useEffect } from "react";
import apiClient from "../api/apiClient"; // Asegúrate de que este archivo exista

const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000; // 3 horas

export const useOrganizationData = (
	isAuthenticated,
	setNotification,
	fetchTemplates
) => {
	// Data
	const [organizaciones, setOrganizaciones] = useState(() => {
		try {
			const cachedData = localStorage.getItem("organizaciones_cache");
			if (!cachedData) return [];
			const { data, timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - CACHE_EXPIRATION_MS > timestamp;
			return isExpired ? [] : data;
		} catch (error) {
			return [];
		}
	});
	const [lastRefreshTs, setLastRefreshTs] = useState(() => {
		try {
			const cachedData = localStorage.getItem("organizaciones_cache");
			if (!cachedData) return null;
			const { timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - CACHE_EXPIRATION_MS > timestamp;
			return isExpired ? null : timestamp;
		} catch (e) {
			return null;
		}
	});

	// Loading & Error
	const [isLoading, setIsLoading] = useState(organizaciones.length === 0);
	const [error, setError] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	// Lógica de Carga Inicial
	const fetchOrganizaciones = useCallback(async () => {
		setIsLoading(true);
		setError(null);
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
			setNotification({
				type: "error",
				title: "Error de Conexión",
				message: "No se pudieron cargar los datos de las organizaciones.",
			});
		} finally {
			setIsLoading(false);
		}
	}, [setNotification]);

	// Data Refresh (Coordina la recarga de Organizaciones y Plantillas)
	const handleRefresh = useCallback(() => {
		localStorage.removeItem("organizaciones_cache");
		setOrganizaciones([]);
		setLastRefreshTs(null);
		fetchOrganizaciones();
		fetchTemplates(); // Llama a la función del hook de campañas
	}, [fetchOrganizaciones, fetchTemplates]);

	// Efecto de Carga Inicial para Organizaciones
	useEffect(() => {
		if (isAuthenticated && organizaciones.length === 0) {
			fetchOrganizaciones();
		}
	}, [isAuthenticated, organizaciones.length, fetchOrganizaciones]);

	return {
		organizaciones,
		setOrganizaciones,
		lastRefreshTs,
		setLastRefreshTs,
		isLoading,
		setIsLoading,
		error,
		setError,
		isSaving,
		setIsSaving,
		handleRefresh,
	};
};
