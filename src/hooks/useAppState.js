/* eslint-disable no-unused-vars */
// src/hooks/useAppState.js
import React, { useState, useMemo, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";
import { useDashboardData } from "./useDashboardData";
import { tiposCampana } from "../data/data"; // Necesario para inicializar plantillas
import { seedIfEmpty, saveTemplates } from "../utils/campaignsStore"; // Necesario para plantillas

const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000;

// Plantilla por defecto para prompts (modo RAW)
const DEFAULT_PROMPT = `Tu tarea es... (código de prompt omitido por brevedad)`;

export const useAppState = () => {
	// --- ESTADO DE AUTENTICACIÓN ---
	const [currentUser, setCurrentUser] = useState(() => {
		try {
			const item = localStorage.getItem("currentUser");
			return item ? JSON.parse(item) : null;
		} catch (e) {
			console.error("Error al parsear currentUser de localStorage", e);
			return null;
		}
	});
	const [isAuthenticated, setIsAuthenticated] = useState(() => !!currentUser);

	// --- ESTADO DE UI GLOBAL ---
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [activeView, setActiveView] = useState("listado");
	const [selectedOrg, setSelectedOrg] = useState(null);
	const [showCampaignModal, setShowCampaignModal] = useState(false);
	const [notification, setNotification] = useState(null);
	const [confirmProps, setConfirmProps] = useState({
		show: false,
		title: "",
		message: "",
		onConfirm: () => {},
		type: "info",
	});

	// --- ESTADO DE FILTROS Y PAGINACIÓN ---
	const [filterStatus, setFilterStatus] = useState("todos");
	const [filterType, setFilterType] = useState("todos");
	const [filterIsla, setFilterIsla] = useState("todos");
	const [filterSuscripcion, setFilterSuscripcion] = useState("todos");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedCampaignId, setSelectedCampaignId] = useState(null);

	// --- ESTADO DE DATOS Y CACHÉ ---
	const [lastRefreshTs, setLastRefreshTs] = useState(() => {
		try {
			const cachedData = localStorage.getItem("organizaciones_cache");
			if (!cachedData) return null;
			const { timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - timestamp > CACHE_EXPIRATION_MS;
			return isExpired ? null : timestamp;
		} catch (e) {
			return null;
		}
	});

	const [organizaciones, setOrganizaciones] = useState(() => {
		try {
			const cachedData = localStorage.getItem("organizaciones_cache");
			if (!cachedData) return [];
			const { data, timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - timestamp > CACHE_EXPIRATION_MS;
			return isExpired ? [] : data;
		} catch (error) {
			console.error("Error al leer desde localStorage", error);
			return [];
		}
	});

	// --- ESTADO DE PROCESOS/CARGA ---
	const [isLoading, setIsLoading] = useState(organizaciones.length === 0);
	const [error, setError] = useState(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isSendingCampaign, setIsSendingCampaign] = useState(false);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [emailPreview, setEmailPreview] = useState(null); // { subject, body }

	// --- ESTADO DE CAMPAÑAS Y PLANTILLAS ---
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

	// --- ESTADO DE CALL CENTER ---
	const [isCallCenterMode, setIsCallCenterMode] = useState(false);
	const [currentQueueId, setCurrentQueueId] = useState(null);
	const [currentTask, setCurrentTask] = useState(null); // Contendrá { taskInfo, organization, email }
	const [isTaskLoading, setIsTaskLoading] = useState(false);

	// --- DATA DASHBOARD (mediante hook externo) ---
	const { metricas, estadosData, islasData, sectoresData } =
		useDashboardData(organizaciones);

	// =====================================================
	// --- MANEJADORES DE ESTADO Y UTILIDADES ---
	// =====================================================

	const closeConfirm = useCallback(() => {
		setConfirmProps({
			show: false,
			title: "",
			message: "",
			onConfirm: () => {},
			type: "info",
		});
	}, []);

	const handleLogout = useCallback(() => {
		localStorage.removeItem("currentUser");
		setCurrentUser(null);
		setIsAuthenticated(false);
		setActiveView("listado");
	}, []);

	const handleLoginSuccess = useCallback((userData) => {
		localStorage.setItem("currentUser", JSON.stringify(userData.user));
		setCurrentUser(userData.user);
		setIsAuthenticated(true);
		setActiveView("listado");
	}, []);

	const handleTemplatesChange = useCallback((next) => {
		setCampaignTemplates(next);
		saveTemplates(next);
	}, []);

	const handleRefresh = useCallback(() => {
		localStorage.removeItem("organizaciones_cache");
		setOrganizaciones([]);
		setCurrentPage(1);
		setLastRefreshTs(null);
	}, []);

	const openEditor = useCallback((org) => {
		setSelectedOrg(org);
		setActiveView("editor");
	}, []);

	const viewDetail = useCallback((org) => {
		setSelectedOrg(org);
		setActiveView("detalle");
	}, []);

	const handleOpenCampaignModal = useCallback((org) => {
		setSelectedOrg(org);
		setEmailPreview(null);
		setCurrentTask(null);
		setIsCallCenterMode(false);
		setShowCampaignModal(true);
	}, []);

	// =====================================================
	// --- LÓGICA DE NEGOCIO (API Y IA) ---
	// =====================================================

	// Construcción del Prompt
	const buildPromptFromTemplate = useCallback((template, org) => {
		if (!template) return DEFAULT_PROMPT;
		if (template.mode === "raw" && template.rawPrompt)
			return template.rawPrompt;
		const persona = org?.nombres_org || org?.nombre || "[Contacto]";
		const industria = org?.sector || org?.industria || "[Industria]";
		const orgName = org?.organizacion || org?.nombre || "[Organización]";
		const header = `Genera un correo de tipo "${
			template?.builder?.campaignType || template.id
		}" para la organización "${orgName}".`;
		const meta = `Datos del destinatario: contacto: ${persona}; industria: ${industria}.`;
		const baseInstr = `El tono debe ser profesional pero cercano. El asunto corto y atractivo. El cuerpo conciso.`;
		const extra = template?.builder?.instructions
			? `Instrucciones extra: ${template.builder.instructions}`
			: "";
		return [
			header,
			`Título de campaña: ${template.title}`,
			`Descripción: ${template.description}`,
			meta,
			baseInstr,
			extra,
		]
			.filter(Boolean)
			.join("\n");
	}, []);

	// FUNCIÓN 1: Generar el borrador (Preview)
	const handleGeneratePreview = useCallback(
		async (orgToPreview, campaignIdToPreview) => {
			const organization = orgToPreview || selectedOrg;
			const campaignId = campaignIdToPreview || selectedCampaignId;

			if (!organization || !campaignId) {
				setNotification({
					type: "warning",
					title: "Selección Requerida",
					message: "Por favor, selecciona una organización y una campaña.",
				});
				return;
			}
			setIsPreviewLoading(true);
			setEmailPreview(null);
			try {
				const template = campaignTemplates.find((t) => t.id === campaignId);
				const prompt = buildPromptFromTemplate(template, organization);
				const payload = {
					data: {
						organization: organization,
						campaign: {
							id: template.id,
							title: template.title,
							description: template.description,
							mode: template.mode,
							prompt,
						},
					},
				};
				const response = await apiClient.generatePreview(payload);
				setEmailPreview(response.data);
				setNotification({
					type: "success",
					title: "Borrador Generado",
					message:
						"El borrador de la campaña ha sido generado exitosamente por la IA.",
				});
			} catch (err) {
				console.error("Error al generar el borrador:", err);
				setNotification({
					type: "error",
					title: "Error al Generar Borrador",
					message:
						"No se pudo generar el borrador con la IA. Verifica la conexión con n8n.",
				});
			} finally {
				setIsPreviewLoading(false);
			}
		},
		[
			selectedOrg,
			selectedCampaignId,
			campaignTemplates,
			buildPromptFromTemplate,
		]
	);

	// FUNCIÓN 3: Guardar Contacto
	const saveContact = useCallback(
		async (updatedOrg) => {
			setIsSaving(true);
			setError(null);
			const orgToSend = { ...updatedOrg };
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
				handleRefresh();
				setActiveView("listado");
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
		[handleRefresh]
	);

	// =====================================================
	// --- LÓGICA DE CALL CENTER Y ENVÍO ---
	// =====================================================

	// FUNCIÓN 4.1: Call Center - Obtener siguiente tarea (usado internamente y en envío)
	const fetchNextTask = useCallback(
		async (queueId, campaignId) => {
			setIsTaskLoading(true);
			setShowCampaignModal(true);
			setEmailPreview(null);
			const CURRENT_USER_ID = currentUser?.usuario || "user_default"; // Asegurar un ID de usuario

			try {
				if (!queueId)
					throw new Error("Intento de fetch sin un queueId activo.");

				const taskResponse = await apiClient.getNextInQueue(
					queueId,
					CURRENT_USER_ID
				);

				if (taskResponse.data && taskResponse.data.organization) {
					const taskData = taskResponse.data;
					const organization = taskData.organization;

					const template = campaignTemplates.find((t) => t.id === campaignId);
					if (!template) throw new Error("Plantilla no encontrada.");

					const prompt = buildPromptFromTemplate(template, organization);

					const previewPayload = {
						data: { organization, campaign: { ...template, prompt } },
					};
					const emailResponse = await apiClient.generatePreview(previewPayload);

					setCurrentTask(taskData);
					setSelectedOrg(organization);
					setEmailPreview(emailResponse.data);
				} else {
					setNotification({
						type: "success",
						title: "Cola Finalizada",
						message: "¡Has procesado todas las organizaciones en la cola!",
					});
					setIsCallCenterMode(false);
					setShowCampaignModal(false);
					setCurrentQueueId(null);
					setCurrentTask(null);
				}
			} catch (err) {
				console.error("Error fetching next task:", err);
				setNotification({
					type: "error",
					title: "Error de Red",
					message: "No se pudo cargar la siguiente tarea de la cola.",
				});
				setIsCallCenterMode(false);
			} finally {
				setIsTaskLoading(false);
			}
		},
		[currentUser, campaignTemplates, buildPromptFromTemplate]
	);

	// FUNCIÓN 2.1: Lógica REAL de envío
	const _executeConfirmAndSend = useCallback(
		async (finalContent) => {
			setIsSendingCampaign(true);
			try {
				const payload = {
					organizationId: selectedOrg.id,
					subject: finalContent.subject,
					body: finalContent.body,
					...(currentTask?.taskInfo && { taskInfo: currentTask.taskInfo }),
					campaignId: selectedCampaignId || undefined,
					sentAt: new Date().toISOString(),
					updateHaceDias: true,
				};

				const response = await apiClient.confirmAndSend(payload);
				let result = response.data;

				// ... (Lógica de parseo y manejo de respuesta) ...
				if (typeof result === "string") {
					try {
						result = JSON.parse(result);
					} catch (e) {
						/* ignore */
					}
				}

				if (result && result.status === "success") {
					setNotification({
						type: "success",
						title: "Campaña Enviada",
						message: `La campaña para ${
							selectedOrg.organizacion || selectedOrg.nombre
						} se ha enviado correctamente.`,
					});
					if (isCallCenterMode) {
						fetchNextTask(currentQueueId, selectedCampaignId);
					} else {
						handleRefresh();
						setShowCampaignModal(false);
						setEmailPreview(null);
						setSelectedCampaignId(null);
					}
				} else if (result && result.status === "canceled") {
					setNotification({
						type: "warning",
						title: "Envío Cancelado",
						message: result.message || "Envío de campaña cancelado.",
					});
				} else {
					setNotification({
						type: "error",
						title: "Respuesta Inesperada",
						message: `Estado recibido: "${result?.status || "undefined"}".`,
					});
				}
			} catch (err) {
				console.error("Error al enviar la campaña:", err);
				setNotification({
					type: "error",
					title: "Error de Conexión",
					message: "No se pudo completar el envío.",
				});
			} finally {
				setIsSendingCampaign(false);
				if (!isCallCenterMode) {
					setShowCampaignModal(false);
					setEmailPreview(null);
				}
			}
		},
		[
			selectedOrg,
			selectedCampaignId,
			currentTask,
			isCallCenterMode,
			currentQueueId,
			handleRefresh,
			fetchNextTask,
		]
	);

	// FUNCIÓN 2.2: Confirmación de envío
	const handleConfirmAndSend = useCallback(
		(finalContent) => {
			setConfirmProps({
				show: true,
				title: "Confirmar Envío de Correo",
				message: `¿Estás seguro de que quieres enviar este correo a ${
					selectedOrg?.organizacion || selectedOrg?.nombre
				}?`,
				confirmText: "Enviar Correo",
				type: "info",
				onConfirm: () => {
					_executeConfirmAndSend(finalContent);
					closeConfirm();
				},
			});
		},
		[_executeConfirmAndSend, closeConfirm, selectedOrg]
	);

	// FUNCIÓN 4.2: Call Center - Lógica REAL de inicio
	const _executeStartCallCenterMode = useCallback(
		async (selectedOrgs) => {
			setIsTaskLoading(true);
			try {
				const orgIds = selectedOrgs.map((org) => org.id);
				const response = await apiClient.createDynamicQueue(orgIds);
				const { queueId } = response.data;
				if (queueId) {
					setCurrentQueueId(queueId);
					setIsCallCenterMode(true);
					await fetchNextTask(queueId, selectedCampaignId);
				} else {
					throw new Error("La API no devolvió un queueId.");
				}
			} catch (err) {
				console.error("Error al iniciar el modo call center:", err);
				setNotification({
					type: "error",
					title: "Error al Crear Cola",
					message: "No se pudo generar la cola de envíos.",
				});
			} finally {
				setIsTaskLoading(false);
			}
		},
		[fetchNextTask, selectedCampaignId]
	);

	// FUNCIÓN 4.3: Call Center - Confirmación de inicio
	const startCallCenterMode = useCallback(
		(selectedOrgs) => {
			if (!selectedCampaignId) {
				setNotification({
					type: "warning",
					title: "Campaña no seleccionada",
					message:
						"Por favor, selecciona una campaña del listado antes de iniciar el Modo Call Center.",
				});
				return;
			}

			if (!selectedOrgs || selectedOrgs.length < 2) {
				setNotification({
					type: "warning",
					title: "Selección Insuficiente",
					message:
						"Debes seleccionar al menos 2 organizaciones para iniciar el modo call center.",
				});
				return;
			}
			setConfirmProps({
				show: true,
				title: "Iniciar Modo Call Center",
				message: `¿Estás seguro de que quieres generar una cola con ${selectedOrgs.length} organizaciones?`,
				confirmText: "Generar Cola",
				type: "info",
				onConfirm: () => {
					_executeStartCallCenterMode(selectedOrgs);
					closeConfirm();
				},
			});
		},
		[_executeStartCallCenterMode, selectedCampaignId, closeConfirm]
	);

	// =====================================================
	// --- EFECTOS (SIDE EFFECTS) ---
	// =====================================================

	// Efecto para la carga inicial de organizaciones
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
	}, [organizaciones.length, isAuthenticated]);

	// =====================================================
	// --- RETORNO DEL HOOK ---
	// =====================================================
	return {
		currentUser,
		isAuthenticated,
		handleLoginSuccess,
		handleLogout,
		isSidebarCollapsed,
		setIsSidebarCollapsed,
		activeView,
		setActiveView,
		selectedOrg,
		setSelectedOrg,
		showCampaignModal,
		setShowCampaignModal,
		notification,
		setNotification,
		confirmProps,
		setConfirmProps,
		closeConfirm,
		filterStatus,
		setFilterStatus,
		filterType,
		setFilterType,
		filterIsla,
		filterSuscripcion,
		setFilterSuscripcion,
		currentPage,
		setCurrentPage,
		organizaciones,
		lastRefreshTs,
		handleRefresh,
		isLoading,
		error,
		isSaving,
		isSendingCampaign,
		isPreviewLoading,
		campaignTemplates,
		handleTemplatesChange,
		selectedCampaignId,
		setSelectedCampaignId,
		emailPreview,
		handleGeneratePreview,
		handleConfirmAndSend,
		isCallCenterMode,
		isTaskLoading,
		startCallCenterMode,
		_executeStartCallCenterMode,
		openEditor,
		viewDetail,
		handleOpenCampaignModal,
		saveContact,
		metricas,
		estadosData,
		islasData,
		sectoresData,
	};
};
