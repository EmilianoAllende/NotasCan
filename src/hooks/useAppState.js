/* eslint-disable no-unused-vars */
// src/hooks/useAppState.js
import React, { useState, useMemo, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";
import { useDashboardData } from "./useDashboardData";

const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000;




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
			if (!cachedData) return []; // <-- Devuelve array vacío si no hay caché

			const { data, timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - timestamp > CACHE_EXPIRATION_MS;

			// --- ¡LA CLAVE! Asegurarse de que 'data' sea un array ---
			if (isExpired || !Array.isArray(data)) {
				localStorage.removeItem("organizaciones_cache");
				return []; // Devuelve array vacío si está expirado o corrupto
			}
			
			return data; // Solo devuelve 'data' si es un array válido
		} catch (error) {
			console.error("Error al leer desde localStorage", error);
			return []; // Devuelve array vacío en cualquier error
		}
	});

	// --- ESTADO DE PROCESOS/CARGA ---
	const [isLoading, setIsLoading] = useState(organizaciones.length === 0);
	const [error, setError] = useState(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isSendingCampaign, setIsSendingCampaign] = useState(false);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [emailPreview, setEmailPreview] = useState(null); // { subject, body }

	// --- ¡MODIFICADO! ESTADO DE CAMPAÑAS Y PLANTILLAS ---
	const [campaignTemplates, setCampaignTemplates] = useState([]); // Inicia vacío
	const [isLoadingTemplates, setIsLoadingTemplates] = useState(true); // Nuevo estado de carga

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

	// --- ¡CORREGIDO! Carga de Plantillas (Más Segura y Mapeada) ---
	const fetchTemplates = useCallback(async () => {
		setIsLoadingTemplates(true);
		try {
			const response = await apiClient.getTemplates();

			if (Array.isArray(response.data)) {
				// Mapeamos los datos de la DB al formato que espera el Frontend.
				const mappedTemplates = response.data.map(template => ({
					// Renombramos 'builder_config' (DB) a 'builder' (React)
					// y nos aseguramos de que sea un objeto si es nulo
					builder: template.builder_config || { campaignType: '', instructions: '', examplesGood: '', examplesBad: '', useMetadata: true },
					
					// Nos aseguramos de que los campos de texto NUNCA sean 'null'
					// para evitar el error de "uncontrolled input"
					id: template.id, // El ID debe existir
					title: template.title || '',
					description: template.description || '',
					mode: template.mode || 'builder',
					rawPrompt: template.rawPrompt || '',
				}));
				// --- FIN DEL CAMBIO ---

				setCampaignTemplates(mappedTemplates);

			} else {
				// ... (Manejo de error si la API no devuelve un array)
				console.error("Error: la API de plantillas no devolvió un array.", response.data);
				setCampaignTemplates([]); 
				setNotification({
					type: "error",
					title: "Error de Datos",
					message: "La API de plantillas devolvió datos inesperados.",
				});
			}
		} catch (err) {
			// ... (Manejo de error de red)
			console.error("Error al cargar plantillas:", err);
			setNotification({
				type: "error",
				title: "Error al Cargar Plantillas",
				message: `No se pudieron cargar las plantillas: ${err.message}`,
			});
			setCampaignTemplates([]); 
		} finally {
			setIsLoadingTemplates(false);
		}
	}, []);

	// --- ¡MODIFICADO! handleRefresh ---
	const handleRefresh = useCallback(() => {
		localStorage.removeItem("organizaciones_cache");
		setOrganizaciones([]);
		setCurrentPage(1);
		setLastRefreshTs(null);
		fetchTemplates(); // <-- Refresca plantillas también
	}, [fetchTemplates]);

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

	// --- Handlers para el Editor de Campañas ---
	const handleSaveTemplate = useCallback(
		async (templateData) => {
			try {
				await apiClient.saveTemplate(templateData); // Llama al POST (Upsert)
				setNotification({
					type: "success",
					title: "Plantilla Guardada",
					message: "Los cambios se guardaron en la base de datos.",
				});
				await fetchTemplates(); // Refresca la lista
			} catch (err) {
				console.error("Error al guardar plantilla:", err);
				setNotification({
					type: "error",
					title: "Error al Guardar",
					message: "No se pudo guardar la plantilla.",
				});
			}
		},
		[fetchTemplates]
	);

	const handleDeleteTemplate = useCallback(
		async (templateId) => {
			console.log("useAppState: handleDeleteTemplate llamado con ID:", templateId); // LOG
			try {
				// La API ahora devuelve una respuesta de éxito genérica, no los datos borrados.
				await apiClient.deleteTemplate(templateId);

				setNotification({
					type: "success",
					title: "Plantilla Eliminada",
					message: "La plantilla fue eliminada.",
				});

				await fetchTemplates(); // Refresca la lista

				console.log("useAppState: Borrado y refresco completados."); // LOG
			} catch (err) {
				// --- ¡LA CLAVE! Atrapamos el error que estaba silente ---
				console.error("Error al eliminar plantilla:", err);
				setNotification({
					type: "error",
					title: "Error al Eliminar",
					message: `No se pudo eliminar la plantilla. Error: ${err.message || "Desconocido" }`,
				});
			}
		},
		[fetchTemplates]
	);

	// --- FUNCIÓN 1: Generar el borrador (Preview) ---
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
		// Ya no construimos el prompt. Solo enviamos los IDs.
				const payload = {
					organization: organization,
					campaignId: campaignId,
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
			selectedOrg, selectedCampaignId
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

	// --- FUNCIÓN 4.1: Call Center - Obtener siguiente tarea ---
	const fetchNextTask = useCallback(
		async (queueId, campaignId) => {
			setIsTaskLoading(true);
			setShowCampaignModal(true);
			setEmailPreview(null);
			const CURRENT_USER_ID = currentUser?.usuario || "user_default";

			try {
				if (!queueId)
					throw new Error("Intento de fetch sin un queueId activo.");

				const taskResponse = await apiClient.getNextInQueue( //
					queueId,
					CURRENT_USER_ID
				);

				if (taskResponse.data && taskResponse.data.organization) {
					const taskData = taskResponse.data;
					const organization = taskData.organization;

					// 2. Llamar a generatePreview con el payload simple
					const payload = {
						organization: organization,
						campaignId: campaignId, // campaignId viene como argumento
					};
					const emailResponse = await apiClient.generatePreview(payload);

					// 3. Establecer estado
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
		[currentUser]
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

	// --- ¡CORREGIDO! Efecto de Carga Inicial ---
	useEffect(() => {
		if (isAuthenticated) {
			// Cargar organizaciones
			if (organizaciones.length === 0) {
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
			// --- ¡AÑADIDO! Cargar plantillas ---
			if (campaignTemplates.length === 0) {
				fetchTemplates();
			}

		}
	}, [isAuthenticated, organizaciones.length, campaignTemplates.length, fetchTemplates]); // <-- Dependencias corregidas

	// =====================================================
	// --- RETORNO DEL HOOK ---
	// =====================================================
	return {
		// Auth & User
		currentUser,
		isAuthenticated,
		handleLoginSuccess,
		handleLogout,
		// UI State
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
		// Filters
		filterStatus,
		setFilterStatus,
		filterType,
		setFilterType,
		filterIsla,
		filterSuscripcion,
		setFilterSuscripcion,
		currentPage,
		setCurrentPage,
		// Data
		organizaciones,
		lastRefreshTs,
		handleRefresh,
		isLoading,
		error,
		// Procesos
		isSaving,
		isSendingCampaign,
		isPreviewLoading,
		campaignTemplates,
		isLoadingTemplates,
		handleSaveTemplate,
		handleDeleteTemplate,
		onAddTemplate: handleSaveTemplate,
		selectedCampaignId,
		setSelectedCampaignId,
		// Campañas
		emailPreview,
		setEmailPreview,
		handleGeneratePreview,
		handleConfirmAndSend,
		// Call Center
		isCallCenterMode,
		isTaskLoading,
		startCallCenterMode,
		_executeStartCallCenterMode,
		// Handlers de Navegación
		openEditor,
		viewDetail,
		handleOpenCampaignModal,
		// Handlers de Datos
		saveContact,
		// Dashboard Data
		metricas,
		estadosData,
		islasData,
		sectoresData,
	};
};
