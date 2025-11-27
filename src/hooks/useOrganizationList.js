// src/hooks/useOrganizationList.js
import { useState, useMemo, useEffect, useCallback } from "react";
// Importamos las utilidades correctamente (Agregado ESTADOS_CLIENTE)
import { getEntityType, ESTADOS_CLIENTE } from "../utils/organizationUtils";
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
				matchesSubType &&
				matchesIsla &&
				matchesSuscripcion
			);
		});
	}, [
		organizaciones,
		searchTerm,
		filterStatus,
		filterType,
		filterSubType,
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
		filterSubType,
		filterIsla,
		filterSuscripcion,
		setCurrentPage,
	]);

	useEffect(() => setSelectedOrgIds(new Set()), [currentPage]);

	// --- FUNCIÓN MODIFICADA: Resetea a los valores por defecto ---
	const handleClearFilters = useCallback(() => {
		setSearchTerm("");
		
		// 1. Restauramos a Lista Blanca (valor por defecto)
		setFilterStatus(ESTADOS_CLIENTE.LISTA_BLANCA);
		
		setFilterType("todos");
		setFilterSubType("todos");
		setFilterIsla("todos");
		
		// 2. Restauramos a Suscripción Activa (valor por defecto)
		setFilterSuscripcion("activa");
		
		setCurrentPage(1);
		setSelectedOrgIds(new Set());
		setSelectedCampaignId(null);
	}, [
		setFilterStatus,
		setFilterType,
		// setFilterSubType es local, no necesita estar en deps
		setFilterIsla,
		setFilterSuscripcion,
		setCurrentPage,
		setSelectedCampaignId,
	]);

	// --- VARIABLE MODIFICADA: Verifica contra los valores por defecto ---
	const isClean =
		searchTerm === "" &&
		filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA && // Verifica si es Lista Blanca
		filterType === "todos" &&
		filterSubType === "todos" &&
		filterIsla === "todos" &&
		filterSuscripcion === "activa" && // Verifica si es Activa
		(selectedCampaignId === null || selectedCampaignId === "");

	const isLoading = organizaciones.length === 0;

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
		filterSubType,
		setFilterSubType,
	};
};