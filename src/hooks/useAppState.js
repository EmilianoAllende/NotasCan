// src/hooks/useAppState.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useMemo, useCallback } from "react";
import { useDashboardData } from "./useDashboardData";
import { tiposCampana } from "../data/data";
import { seedIfEmpty, saveTemplates } from "../utils/campaignsStore";
import DEFAULT_PROMPT from "../utils/defaultPrompt";
// Importación de los nuevos hooks de lógica/handlers
import { useAuthHandlers } from "./useAuthHandlers";
import { useDataHandlers } from "./useDataHandlers";
import { useNavigationHandlers } from "./useNavigationHandlers";
import { useCampaignLogic } from "./useCampaignLogic";

export const useAppState = () => {
	// --- 1. DECLARACIONES DE ESTADO (STATE) ---

	// Auth
	const [currentUser, setCurrentUser] = useState(() => {
		try {
			const item = localStorage.getItem("currentUser");
			return item ? JSON.parse(item) : null;
		} catch (e) {
			return null;
		}
	});
	const [isAuthenticated, setIsAuthenticated] = useState(() => !!currentUser);

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
		type: "info",
	});

	// Filters
	const [filterStatus, setFilterStatus] = useState("todos");
	const [filterType, setFilterType] = useState("todos");
	const [filterIsla, setFilterIsla] = useState("todos");
	const [filterSuscripcion, setFilterSuscripcion] = useState("todos");
	const [currentPage, setCurrentPage] = useState(1);

	// Data
	const [organizaciones, setOrganizaciones] = useState(() => {
		// ... (lógica de caché) ...
		try {
			const cachedData = localStorage.getItem("organizaciones_cache");
			if (!cachedData) return [];
			const { data, timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - 3 * 60 * 60 * 1000 > timestamp;
			return isExpired ? [] : data;
		} catch (error) {
			return [];
		}
	});
	const [lastRefreshTs, setLastRefreshTs] = useState(() => {
		// ... (lógica de caché) ...
		try {
			const cachedData = localStorage.getItem("organizaciones_cache");
			if (!cachedData) return null;
			const { timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - 3 * 60 * 60 * 1000 > timestamp;
			return isExpired ? null : timestamp;
		} catch (e) {
			return null;
		}
	});

	// Loading
	const [isLoading, setIsLoading] = useState(organizaciones.length === 0);
	const [error, setError] = useState(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isSendingCampaign, setIsSendingCampaign] = useState(false);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [isTaskLoading, setIsTaskLoading] = useState(false);

	// Campaign & Call Center
	const [selectedCampaignId, setSelectedCampaignId] = useState(null);
	const [emailPreview, setEmailPreview] = useState(null);
	const [isCallCenterMode, setIsCallCenterMode] = useState(false);
	const [currentQueueId, setCurrentQueueId] = useState(null);
	const [currentTask, setCurrentTask] = useState(null);
	const [campaignTemplates, setCampaignTemplates] = useState(() => {
		const defaults = Object.entries(tiposCampana).map(([id, t]) => ({
			id,
			title: t.nombre,
			description: t.descripcion,
			mode: "builder",
			rawPrompt: DEFAULT_PROMPT,
			builder: {
				campaignType: id,
				instructions: "",
				examplesGood: "",
				examplesBad: "",
				useMetadata: true,
			},
		}));
		return seedIfEmpty(defaults);
	});
	// --- 2. SETTERS Y HANDLERS SIMPLES ---
	const closeConfirm = useCallback(() => {
		setConfirmProps({
			show: false,
			title: "",
			message: "",
			onConfirm: () => {},
			type: "info",
		});
	}, []);

	const handleTemplatesChange = useCallback((next) => {
		setCampaignTemplates(next);
		saveTemplates(next);
	}, []);

	// --- 3. DATA DERIVADA (HOOKS MEMORIZADOS) ---

	const { metricas, estadosData, islasData, sectoresData } =
		useDashboardData(organizaciones);

	// --- 4. HANDLERS COMPLEJOS (HOOKS MODULARIZADOS) ---

	const { handleLoginSuccess, handleLogout } = useAuthHandlers(
		setCurrentUser,
		setIsAuthenticated,
		setActiveView
	);

	const { handleRefresh, saveContact } = useDataHandlers(
		isAuthenticated,
		organizaciones,
		setOrganizaciones,
		setLastRefreshTs,
		setIsLoading,
		setError,
		setIsSaving,
		setActiveView,
		setNotification
	);

	const { openEditor, viewDetail, handleOpenCampaignModal } =
		useNavigationHandlers(
			setActiveView,
			setSelectedOrg,
			setEmailPreview,
			setCurrentTask,
			setIsCallCenterMode,
			setShowCampaignModal
		);

	const campaignLogicProps = {
		currentUser,
		selectedOrg,
		selectedCampaignId,
		campaignTemplates,
		isCallCenterMode,
		currentQueueId,
		currentTask,
		setIsPreviewLoading,
		setEmailPreview,
		setNotification,
		setIsSendingCampaign,
		setShowCampaignModal,
		setSelectedCampaignId,
		setIsCallCenterMode,
		setCurrentQueueId,
		setCurrentTask,
		setSelectedOrg,
		setIsTaskLoading,
		setConfirmProps,
		closeConfirm,
		handleRefresh,
	};
	const campaignHandlers = useCampaignLogic(campaignLogicProps);

	// --- 5. RETORNO DE TODO EL ESTADO Y HANDLERS ---
	return {
		// Auth
		currentUser,
		isAuthenticated,
		handleLoginSuccess,
		handleLogout,
		// UI
		isSidebarCollapsed,
		setIsSidebarCollapsed,
		activeView,
		setActiveView,
		selectedOrg,
		setSelectedOrg,
		// Modals
		showCampaignModal,
		setShowCampaignModal,
		notification,
		setNotification,
		confirmProps,
		setConfirmProps,
		closeConfirm,
		// Data
		organizaciones,
		lastRefreshTs,
		// Filters
		filterStatus,
		setFilterStatus,
		filterType,
		setFilterType,
		filterIsla,
		setFilterIsla,
		filterSuscripcion,
		setFilterSuscripcion,
		currentPage,
		setCurrentPage,
		// Loaders
		isLoading,
		error,
		isSaving,
		isSendingCampaign,
		isPreviewLoading,
		isTaskLoading,
		// Campaigns
		campaignTemplates,
		handleTemplatesChange,
		selectedCampaignId,
		setSelectedCampaignId,
		emailPreview,
		setEmailPreview, // Pasamos el setter
		// Call Center
		isCallCenterMode,
		// Handlers
		handleRefresh,
		saveContact,
		openEditor,
		viewDetail,
		handleOpenCampaignModal,
		...campaignHandlers,
		// Dashboard
		metricas,
		estadosData,
		islasData,
		sectoresData,
	};
};
