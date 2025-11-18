// src/hooks/useCallCenterAndCampaignFlow.js
import { useState, useCallback } from "react";
import apiClient from "../api/apiClient"; // Asegúrate de que este archivo exista

export const useCallCenterAndCampaignFlow = (
	currentUser,
	selectedOrg,
	selectedCampaignId,
	setNotification,
	setConfirmProps,
	closeConfirm,
	setShowCampaignModal,
	setSelectedOrg,
	handleRefresh // Refresh global de datos de organizaciones
) => {
	// State
	const [emailPreview, setEmailPreview] = useState(null);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [isSendingCampaign, setIsSendingCampaign] = useState(false);
	const [isCallCenterMode, setIsCallCenterMode] = useState(false);
	const [isTaskLoading, setIsTaskLoading] = useState(false);
	const [currentQueueId, setCurrentQueueId] = useState(null);
	const [currentTask, setCurrentTask] = useState(null); // Contendrá { taskInfo, organization, email }

	// Función auxiliar para abrir el modal y limpiar estados
	const handleOpenCampaignModal = useCallback(
		(org) => {
			setSelectedOrg(org);
			setEmailPreview(null);
			setCurrentTask(null);
			setIsCallCenterMode(false);
			setShowCampaignModal(true);
		},
		[setSelectedOrg, setShowCampaignModal]
	);

	// FUNCIÓN 4.1: Call Center - Obtener siguiente tarea
	const fetchNextTask = useCallback(
		async (queueId) => {
			setIsTaskLoading(true);
			setShowCampaignModal(true);
			setEmailPreview(null);
			const campaignId = selectedCampaignId;
			const CURRENT_USER_ID = currentUser?.usuario || "user_default";

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

					// 2. Llamar a generatePreview con el payload simple
					const payload = {
						organization: organization,
						campaignId: campaignId,
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
		[
			currentUser,
			selectedCampaignId,
			setNotification,
			setShowCampaignModal,
			setSelectedOrg,
		]
	);

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
		[selectedOrg, selectedCampaignId, setNotification]
	);

	// FUNCIÓN 2.1: Lógica REAL de envío (Ejecutado después de la confirmación)
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

				// Lógica de parseo y manejo de respuesta
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
						fetchNextTask(currentQueueId);
					} else {
						handleRefresh();
						setShowCampaignModal(false);
						setEmailPreview(null);
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
			setNotification,
			setShowCampaignModal,
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
		[_executeConfirmAndSend, closeConfirm, selectedOrg, setConfirmProps]
	);

	// FUNCIÓN 4.2: Call Center - Lógica REAL de inicio
	const _executeStartCallCenterMode = useCallback(
		async (selectedOrgs) => {
			setIsTaskLoading(true);
			try {
				if (!selectedCampaignId)
					throw new Error("Campaña no seleccionada al iniciar CC.");

				const orgIds = selectedOrgs.map((org) => org.id);
				const response = await apiClient.createDynamicQueue(orgIds);
				const { queueId } = response.data;
				if (queueId) {
					setCurrentQueueId(queueId);
					setIsCallCenterMode(true);
					await fetchNextTask(queueId);
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
		[fetchNextTask, selectedCampaignId, setNotification]
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
		[
			_executeStartCallCenterMode,
			selectedCampaignId,
			closeConfirm,
			setNotification,
			setConfirmProps,
		]
	);

	return {
		emailPreview,
		setEmailPreview,
		isPreviewLoading,
		isSendingCampaign,
		isCallCenterMode,
		isTaskLoading,
		currentTask,
		handleGeneratePreview,
		handleConfirmAndSend,
		startCallCenterMode,
		_executeStartCallCenterMode,
		handleOpenCampaignModal,
	};
};
