// src/hooks/useOrganizationList.js
import { useState, useMemo, useEffect, useCallback } from "react";
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

	// 3. Efectos
	useEffect(() => {
		if (!lastRefreshTs) return setLastRefreshLabel("");
		const update = () => setLastRefreshLabel(getElapsedString(lastRefreshTs));
		update();
		const id = setInterval(update, 60000);
		return () => clearInterval(id);
	}, [lastRefreshTs]);

	// 4. Lógica de datos derivada (Memos)
	const filteredOrgs = useMemo(() => {
		const lower = searchTerm.toLowerCase();
		return organizaciones.filter((org) => {
			const matchesSearch =
				lower === "" ||
				(org.organizacion || "").toLowerCase().includes(lower) ||
				(org.nombre || "").toLowerCase().includes(lower) ||
				(org.id || "").toLowerCase().includes(lower) ||
				(org.nombres_org || "").toLowerCase().includes(lower);
			const tipoEntidad = getEntityType(org);
			const matchesStatus =
				filterStatus === "todos" ? true : org.estado_cliente === filterStatus;
			const matchesType =
				filterType === "todos" ? true : tipoEntidad === filterType;
			const matchesIsla =
				filterIsla === "todos" ? true : org.isla === filterIsla;
			const matchesSuscripcion =
				filterSuscripcion === "todos"
					? true
					: org.suscripcion === filterSuscripcion;
			return (
				matchesSearch &&
				matchesStatus &&
				matchesType &&
				matchesIsla &&
				matchesSuscripcion
			);
		});
	}, [
		organizaciones,
		searchTerm,
		filterStatus,
		filterType,
		filterIsla,
		filterSuscripcion,
	]);

	const totalPages = Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE);

	const getSelectedOrgs = useCallback(
		() => organizaciones.filter((org) => selectedOrgIds.has(org.id)),
		[organizaciones, selectedOrgIds]
	);

	const isCallCenterDisabled = selectedOrgIds.size < 2 || !selectedCampaignId;

	const isClean =
		searchTerm === "" &&
		filterStatus === "todos" &&
		filterType === "todos" &&
		filterIsla === "todos" &&
		filterSuscripcion === "todos" &&
		(selectedCampaignId === null || selectedCampaignId === "");

	const isLoading = organizaciones.length === 0;

	// 5. Handlers y Callbacks
	const handleCampaignClick = useCallback(
		(org) => {
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

	useEffect(() => {
		setCurrentPage(1);
		setSelectedOrgIds(new Set());
	}, [
		searchTerm,
		filterStatus,
		filterType,
		filterIsla,
		filterSuscripcion,
		setCurrentPage,
	]);

	useEffect(() => setSelectedOrgIds(new Set()), [currentPage]);

	const handleClearFilters = useCallback(() => {
		setSearchTerm("");
		setFilterStatus("todos");
		setFilterType("todos");
		setFilterIsla("todos");
		setFilterSuscripcion("todos");
		setCurrentPage(1);
		setSelectedOrgIds(new Set());
		setSelectedCampaignId(null);
	}, [
		setFilterStatus,
		setFilterType,
		setFilterIsla,
		setFilterSuscripcion,
		setCurrentPage,
		setSelectedCampaignId,
	]);

	// 6. Retornamos todo lo que el JSX necesitará
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
	};
};
