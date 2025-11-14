// src/hooks/useCampaignLogic.js
import { useCallback } from "react";
import apiClient from "../api/apiClient";

const DEFAULT_PROMPT = `Tu tarea es... (código de prompt omitido por brevedad)`;

export const useCampaignLogic = (props) => {
	const {
		// State
		currentUser,
		selectedOrg,
		selectedCampaignId,
		campaignTemplates,
		isCallCenterMode,
		currentQueueId,
		currentTask,
		// Setters
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
		// Handlers (de otros hooks)
		handleRefresh,
	} = props;

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
					data: { organization, campaign: { ...template, prompt } },
				};
				const response = await apiClient.generatePreview(payload);
				setEmailPreview(response.data);
				setNotification({
					type: "success",
					title: "Borrador Generado",
					message: "Borrador de IA generado exitosamente.",
				});
			} catch (err) {
				console.error("Error al generar el borrador:", err);
				setNotification({
					type: "error",
					title: "Error de IA",
					message: "No se pudo generar el borrador con la IA.",
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
			setNotification,
			setIsPreviewLoading,
			setEmailPreview,
		]
	);

	const fetchNextTask = useCallback(
		async (queueId, campaignId) => {
			setIsTaskLoading(true);
			setShowCampaignModal(true);
			setEmailPreview(null);
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
		[
			currentUser,
			campaignTemplates,
			buildPromptFromTemplate,
			setNotification,
			setIsTaskLoading,
			setShowCampaignModal,
			setEmailPreview,
			setCurrentTask,
			setSelectedOrg,
			setIsCallCenterMode,
			setCurrentQueueId,
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
						message: `Correo para ${
							selectedOrg.organizacion || selectedOrg.nombre
						} enviado.`,
					});
					if (isCallCenterMode) {
						fetchNextTask(currentQueueId, selectedCampaignId);
					} else {
						handleRefresh();
						setShowCampaignModal(false);
						setEmailPreview(null);
						setSelectedCampaignId(null);
					}
				} else {
					setNotification({
						type: "warning",
						title: "Envío Cancelado",
						message: result.message || "El envío fue cancelado.",
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
			setIsSendingCampaign,
			setNotification,
			setShowCampaignModal,
			setEmailPreview,
			setSelectedCampaignId,
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
		[
			_executeConfirmAndSend,
			closeConfirm,
			selectedOrg?.nombre,
			selectedOrg?.organizacion,
			setConfirmProps,
		]
	);

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
		[
			fetchNextTask,
			selectedCampaignId,
			setIsTaskLoading,
			setCurrentQueueId,
			setIsCallCenterMode,
			setNotification,
		]
	);

	const startCallCenterMode = useCallback(
		(selectedOrgs) => {
			if (!selectedCampaignId) {
				setNotification({
					type: "warning",
					title: "Campaña no seleccionada",
					message: "Por favor, selecciona una campaña antes de iniciar.",
				});
				return;
			}
			if (!selectedOrgs || selectedOrgs.length < 2) {
				setNotification({
					type: "warning",
					title: "Selección Insuficiente",
					message: "Debes seleccionar al menos 2 organizaciones.",
				});
				return;
			}
			setConfirmProps({
				show: true,
				title: "Iniciar Modo Call Center",
				message: `¿Generar una cola con ${selectedOrgs.length} organizaciones?`,
				confirmText: "Generar Cola",
				type: "info",
				onConfirm: () => {
					_executeStartCallCenterMode(selectedOrgs);
					closeConfirm();
				},
			});
		},
		[
			selectedCampaignId,
			setConfirmProps,
			setNotification,
			_executeStartCallCenterMode,
			closeConfirm,
		]
	);

	return {
		buildPromptFromTemplate,
		handleGeneratePreview,
		handleConfirmAndSend,
		startCallCenterMode,
		_executeStartCallCenterMode, // Necesario para el modal
		fetchNextTask, // Necesario para el modal
	};
};
