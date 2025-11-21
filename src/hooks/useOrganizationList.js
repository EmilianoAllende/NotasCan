// src/hooks/useOrganizationList.js
import { useState, useMemo, useEffect, useCallback } from "react";
// Importamos las utilidades correctamente
import { getEntityType } from "../utils/organizationUtils";
import { getElapsedString } from "../utils/dateUtils";

const ITEMS_PER_PAGE = 25;

export const useOrganizationList = (props) => {
	// 1. Recibimos los props globales
	const {
		organizaciones,
		filterStatus,
		setFilterStatus,
		filterType,
		setFilterType,
		filterIsla,
		setFilterIsla,
		filterSuscripcion,
		setFilterSuscripcion,
		lastRefreshTs,
		openCampaign,
		currentPage,
		setCurrentPage,
		campaignTemplates,
		selectedCampaignId,
		setSelectedCampaignId,
		setConfirmProps,
		closeConfirm,
	} = props;

	// 2. Definimos el estado local del componente
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedOrgIds, setSelectedOrgIds] = useState(new Set());
	const [selectedOrg, setSelectedOrg] = useState(null);
	const [lastRefreshLabel, setLastRefreshLabel] = useState("");

	// --- Estado para el subtipo (Nuevo) ---
	const [filterSubType, setFilterSubType] = useState("todos");

	// 3. Efectos
	useEffect(() => {
		if (!lastRefreshTs) return setLastRefreshLabel("");
		const update = () => setLastRefreshLabel(getElapsedString(lastRefreshTs));
		update();
		const id = setInterval(update, 60000);
		return () => clearInterval(id);
	}, [lastRefreshTs]);

	// 4. Lógica de datos derivada (Memos) - EL FILTRADO REAL
	const filteredOrgs = useMemo(() => {
		const lowercasedSearchTerm = searchTerm.toLowerCase();

		return organizaciones.filter((org) => {
			// Búsqueda por texto
			const matchesSearch =
				lowercasedSearchTerm === ""
					? true
					: (org.organizacion || "")
							.toLowerCase()
							.includes(lowercasedSearchTerm) ||
					  (org.nombre || "").toLowerCase().includes(lowercasedSearchTerm) ||
					  (org.id || "").toLowerCase().includes(lowercasedSearchTerm) ||
					  (org.nombres_org || "")
							.toLowerCase()
							.includes(lowercasedSearchTerm);

			// Filtro de Estado
			const matchesStatus =
				filterStatus === "todos" ? true : org.estado_cliente === filterStatus;

			// Filtro de Tipo
			// Usamos el campo directo 'tipo_entidad' si existe, o getEntityType como fallback
			const tipoEntidad = org.tipo_entidad || getEntityType(org);
			const matchesType =
				filterType === "todos" ? true : tipoEntidad === filterType;

			// --- Filtro de Subtipo (Nuevo) ---
			const matchesSubType =
				filterSubType === "todos"
					? true
					: org.sub_tipo_entidad === filterSubType;

			// Filtro de Isla
			const matchesIsla =
				filterIsla === "todos" ? true : org.isla === filterIsla;

			// Filtro de Suscripción
			const matchesSuscripcion =
				filterSuscripcion === "todos"
					? true
					: org.suscripcion === filterSuscripcion;

			return (
				matchesSearch &&
				matchesStatus &&
				matchesType &&
				matchesSubType && // <-- Condición añadida
				matchesIsla &&
				matchesSuscripcion
			);
		});
	}, [
		organizaciones,
		searchTerm,
		filterStatus,
		filterType,
		filterSubType, // <-- Dependencia añadida
		filterIsla,
		filterSuscripcion,
	]);

	const totalPages = Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE);

	// 5. Lógica de Selección y Acciones
	const getSelectedOrgs = useCallback(
		() => organizaciones.filter((org) => selectedOrgIds.has(org.id)),
		[organizaciones, selectedOrgIds]
	);

	const isCallCenterDisabled = selectedOrgIds.size < 2 || !selectedCampaignId;

	const handleCampaignClick = useCallback(
		(org) => {
			if (!selectedCampaignId) {
				setConfirmProps({
					show: true,
					title: "Iniciar Envío",
					message: `¿Seguro que quieres iniciar un envío de campaña para "${
						org.organizacion || org.id
					}"? (Deberás seleccionar una plantilla)`,
					confirmText: "Sí, continuar",
					cancelText: "No, volver",
					type: "info",
					onConfirm: () => {
						openCampaign(org);
						closeConfirm();
					},
				});
				return;
			}

			const templateName =
				campaignTemplates.find((t) => t.id === selectedCampaignId)?.title ||
				"la campaña seleccionada";
			setConfirmProps({
				show: true,
				title: "Confirmar Envío Individual",
				message: `¿Quieres generar un borrador para "${
					org.organizacion || org.id
				}" usando la plantilla "${templateName}"?`,
				confirmText: "Sí, generar",
				cancelText: "No, volver",
				type: "info",
				onConfirm: () => {
					openCampaign(org);
					closeConfirm();
				},
			});
		},
		[
			campaignTemplates,
			selectedCampaignId,
			openCampaign,
			setConfirmProps,
			closeConfirm,
		]
	);

	// Resetear paginación y selección al filtrar
	useEffect(() => {
		setCurrentPage(1);
		setSelectedOrgIds(new Set());
	}, [
		searchTerm,
		filterStatus,
		filterType,
		filterSubType, // <-- Añadido
		filterIsla,
		filterSuscripcion,
		setCurrentPage,
	]);

	useEffect(() => setSelectedOrgIds(new Set()), [currentPage]);

	const handleClearFilters = useCallback(() => {
		setSearchTerm("");
		setFilterStatus("todos");
		setFilterType("todos");
		setFilterSubType("todos"); // <-- ¡Reseteamos el subtipo!
		setFilterIsla("todos");
		setFilterSuscripcion("todos");
		setCurrentPage(1);
		setSelectedOrgIds(new Set());
		setSelectedCampaignId(null);
	}, [
		setFilterStatus,
		setFilterType,
		// setFilterSubType es local, no necesita estar en deps si useCallback se recrea
		setFilterIsla,
		setFilterSuscripcion,
		setCurrentPage,
		setSelectedCampaignId,
	]);

	const isClean =
		searchTerm === "" &&
		filterStatus === "todos" &&
		filterType === "todos" &&
		filterSubType === "todos" && // <-- Añadido
		filterIsla === "todos" &&
		filterSuscripcion === "todos" &&
		(selectedCampaignId === null || selectedCampaignId === "");

	const isLoading = organizaciones.length === 0;

	// --- 6. RETORNO (CORRECCIÓN CRÍTICA) ---
	return {
		searchTerm,
		setSearchTerm,
		selectedOrgIds,
		setSelectedOrgIds,
		selectedOrg,
		setSelectedOrg,
		lastRefreshLabel,
		ITEMS_PER_PAGE,
		filteredOrgs,
		totalPages,
		getSelectedOrgs,
		isCallCenterDisabled,
		handleCampaignClick,
		handleClearFilters,
		isClean,
		isLoading,
		// ¡AQUÍ ESTÁ LA CLAVE! Debemos devolver estas dos variables:
		filterSubType,
		setFilterSubType,
	};
};
