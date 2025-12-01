// src/hooks/useUI.js
import { useState, useCallback } from "react";
// 1. IMPORTA ESTO (Asegúrate de que la ruta sea correcta)
import { ESTADOS_CLIENTE } from "../utils/organizationUtils"; 

export const useUI = () => {
	// UI
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [activeView, setActiveView] = useState("listado");
	const [selectedOrg, setSelectedOrg] = useState(null);

	// Modals & Notifications
	const [showCampaignModal, setShowCampaignModal] = useState(false);
	const [notification, setNotification] = useState(null);
	const [confirmProps, setConfirmProps] = useState({
		show: false,
		title: "",
		message: "",
		onConfirm: () => {},
		confirmText: "Confirmar",
		type: "info",
	});

	// Filters
	// 2. CAMBIA ESTO: De "todos" a la constante de Lista Blanca
	const [filterStatus, setFilterStatus] = useState(ESTADOS_CLIENTE.LISTA_BLANCA);
	
	const [filterType, setFilterType] = useState("todos");
	const [filterIsla, setFilterIsla] = useState("todos");
	
	// 3. CAMBIA ESTO: De "todos" a "activa"
	const [filterSuscripcion, setFilterSuscripcion] = useState("todos");
	
	const [currentPage, setCurrentPage] = useState(1);

	const closeConfirm = useCallback(() => {
		setConfirmProps((prev) => ({
			...prev,
			show: false,
			title: "",
			message: "",
			onConfirm: () => {},
		}));
	}, []);

	// Helper para cambiar de vista y seleccionar organización simultáneamente
	const setViewAndOrg = useCallback((view, org) => {
		setActiveView(view);
		setSelectedOrg(org);
	}, []);

	return {
		// State
		isSidebarCollapsed,
		activeView,
		selectedOrg,
		showCampaignModal,
		notification,
		confirmProps,
		filterStatus,
		filterType,
		filterIsla,
		filterSuscripcion,
		currentPage,
		// Setters
		setIsSidebarCollapsed,
		setActiveView,
		setSelectedOrg,
		setShowCampaignModal,
		setNotification,
		setConfirmProps,
		setFilterStatus,
		setFilterType,
		setFilterIsla,
		setFilterSuscripcion,
		setCurrentPage,
		// Handlers
		closeConfirm,
		setViewAndOrg,
	};
};