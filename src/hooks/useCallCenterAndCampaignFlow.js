import { useState, useCallback } from "react";
import apiClient from "../api/apiClient";

export const useCallCenterAndCampaignFlow = ({
	currentUser,
	selectedOrg,
	selectedCampaignId,
	setNotification,
	setConfirmProps,
	closeConfirm,
	setShowCampaignModal,
	setSelectedOrg,
	handleRefresh 
}) => {
	const [emailPreview, setEmailPreview] = useState(null);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [isSendingCampaign, setIsSendingCampaign] = useState(false);
	const [isCallCenterMode, setIsCallCenterMode] = useState(false);
	const [isTaskLoading, setIsTaskLoading] = useState(false);
	const [currentQueueId, setCurrentQueueId] = useState(null);
	const [currentTask, setCurrentTask] = useState(null);

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
				
				console.log("📤 Payload enviado a generate-preview:", payload);
				
				const emailResponse = await apiClient.generatePreview(payload);
				setEmailPreview(emailResponse.data);
			} catch (err) {
				console.error("Error al generar el borrador:", err);
				setNotification({
					type: "error",
					title: "Error al Generar Borrador",
					message: "No se pudo generar el borrador. Verifica la conexión con n8n.",
				});
			} finally {
				setIsPreviewLoading(false);
			}
		},
		[selectedOrg, selectedCampaignId, setNotification]
	);

	// ✅ MODIFICADO: Ahora pasa campaignId a getNextInQueue
	const fetchNextTask = useCallback(
		async (queueId, skipCurrent = false) => {
			setIsTaskLoading(true);
			setShowCampaignModal(true);
			setEmailPreview(null);
			const campaignId = selectedCampaignId;
			const CURRENT_USER_ID = currentUser?.usuario || "user_default";

			let skipTaskInfo = null;
			if (skipCurrent && currentTask && currentTask.taskInfo) {
				console.log("3. Obteniendo datos de la tarea a saltar:", currentTask.taskInfo);
				skipTaskInfo = currentTask.taskInfo;
			} else if (skipCurrent) {
				console.warn("3.1. Se intentó saltar, pero no se encontró 'currentTask' o 'currentTask.taskInfo'.");
			}

			try {
				if (!queueId)
					throw new Error("Intento de fetch sin un queueId activo.");
				
				if (!campaignId)
					throw new Error("No hay campaignId seleccionado en el modo Call Center.");

				console.log(`4. Llamando a apiClient.getNextInQueue con skipTaskInfo:`, skipTaskInfo);
				// Pasamos campaignId como tercer parámetro a la llamada de la API
				const taskResponse = await apiClient.getNextInQueue(
					queueId,
					CURRENT_USER_ID,
					campaignId,
					skipTaskInfo
				);
				
				if (taskResponse.data && taskResponse.data.organization) {
					const taskData = taskResponse.data;
					const organization = taskData.organization;

					await handleGeneratePreview(organization, campaignId);
					setCurrentTask(taskData);
					setSelectedOrg(organization);
					
					if (skipCurrent) {
						setNotification({
							type: "info",
							title: "Tarea Saltada",
							message: "La tarea anterior ha sido devuelta a la cola con menor prioridad.",
						});
					}
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
			currentTask,
			handleGeneratePreview,
		]
	);

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

	const handleSkipTask = useCallback(() => {
		if (currentQueueId) {
			console.log("2. Ejecutando handleSkipTask con queueId:", currentQueueId);
			fetchNextTask(currentQueueId, true);
		} else {
			console.warn("2.1. Se intentó ejecutar handleSkipTask, pero no hay un 'currentQueueId' activo.");
		}
	}, [currentQueueId, fetchNextTask]);

	return {
		emailPreview,
		setEmailPreview,
		isPreviewLoading,
		isSendingCampaign,
		isCallCenterMode,
		handleSkipTask,
		setIsCallCenterMode,
		isTaskLoading,
		currentTask,
		setCurrentTask,
		handleGeneratePreview,
		handleConfirmAndSend,
		startCallCenterMode,
		_executeStartCallCenterMode,
		handleOpenCampaignModal,
	};
};