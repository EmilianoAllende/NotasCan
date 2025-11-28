import { useState, useCallback, useRef } from "react";
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
	
	// 🔥 NUEVO: Ref para evitar race conditions
	const pendingOrgRef = useRef(null);
	const pendingTaskRef = useRef(null);

const handleOpenCampaignModal = useCallback(
    (org) => {
        // 🔥 LIMPIEZA CRÍTICA: Borrar referencias de la cola anterior
        pendingOrgRef.current = null; 
        pendingTaskRef.current = null;

        // Configuración normal del modo individual
        setSelectedOrg(org);
        setEmailPreview(null);
        setCurrentTask(null);
        setIsCallCenterMode(false);
        setShowCampaignModal(true);
    },
    [setSelectedOrg, setShowCampaignModal]
);
	// --- FUNCIÓN BLINDADA: Obtener siguiente tarea ---
	const fetchNextTask = useCallback(
		async (queueId) => {
			console.log("🔄 Iniciando fetchNextTask con QueueID:", queueId);
			
			// 1. Forzamos UI de carga inmediata y limpiamos estados
			setIsTaskLoading(true); 
			setShowCampaignModal(true); 
			setEmailPreview(null);
			setCurrentTask(null);
			
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
				if (!queueId) throw new Error("Falta queueId activo.");

				// 2. Llamada a API
				const taskResponse = await apiClient.getNextInQueue(
					queueId,
					CURRENT_USER_ID,
                    campaignId 
				);

				console.log("📦 Respuesta n8n (Raw):", taskResponse.data);

				// 3. Normalización de datos (Soporta Array o Objeto)
				// Dentro de fetchNextTask...
const responseData = Array.isArray(taskResponse.data) ? taskResponse.data[0] : taskResponse.data;
const taskData = responseData?.json || responseData;

// VALIDACIÓN ANTI-DUPLICADOS
if (taskData && taskData.organization && pendingOrgRef.current) {
    if (taskData.organization.id === pendingOrgRef.current.id) {
        console.warn("⚠️ n8n devolvió la misma organización que acabamos de terminar. Reintentando...");
        // Podrías lanzar un reintento silencioso aquí o simplemente dejar que el usuario lo note.
        // Lo ideal es que el retraso de 4000ms (4s) que pusiste sea suficiente.
    }
}

				if (taskData && taskData.organization) {
					const organization = taskData.organization;
					
					// 🔥 NORMALIZACIÓN: Asegurar que tenga nombre
					if (!organization.nombre && organization.organizacion) {
						organization.nombre = organization.organizacion;
					}
					
					console.log("✅ Organización recibida:", {
						nombre: organization.nombre,
						id: organization.id,
						email: organization.email_para_envios || organization.id
					});

					// 🔥 CRÍTICO: Guardamos en refs ANTES de setear estados
					pendingOrgRef.current = organization;
					pendingTaskRef.current = taskData;

					// 4. Establecer Organización y Tarea
					setCurrentTask(taskData);
					setSelectedOrg(organization);

                    // 5. Gestión del Email (Preview)
                    let emailData = taskData.email || taskData.json?.email;

                    // 🔥 NUEVO: Validación mejorada
                    if (emailData && typeof emailData === 'object' && emailData.subject && emailData.body) {
                        console.log("✨ Email recibido desde n8n (formato correcto).");
                        setEmailPreview(emailData);
                    } else if (emailData && typeof emailData === 'string') {
                        // 🔥 CASO ESPECIAL: n8n devolvió solo el body como string
                        console.warn("⚠️ Email recibido como string. Generando objeto completo...");
                        
                        const payload = {
                            organization: organization,
                            campaignId: campaignId,
                        };
                        const emailResponse = await apiClient.generatePreview(payload);
                        setEmailPreview(emailResponse.data);
                    } else {
                        // FALLBACK: Si n8n no mandó el email, lo generamos aquí
                        console.warn("⚠️ n8n no devolvió el borrador. Generando localmente...");
                        
                        const payload = {
                            organization: organization,
                            campaignId: campaignId,
                        };
                        const emailResponse = await apiClient.generatePreview(payload);
                        setEmailPreview(emailResponse.data);
                    }
					
				} else {
					console.log("🏁 No se recibió organización. Fin de cola.");
					setNotification({
						type: "success",
						title: "Cola Finalizada",
						message: "¡Has procesado todas las organizaciones en la cola!",
					});
					setIsCallCenterMode(false);
					setShowCampaignModal(false);
					setCurrentQueueId(null);
					setCurrentTask(null);
					setEmailPreview(null);
					pendingOrgRef.current = null;
					pendingTaskRef.current = null;
				}
			} catch (err) {
				console.error("❌ Error fetchNextTask:", err);
				setNotification({
					type: "error",
					title: "Error de Proceso",
					message: "No se pudo cargar la siguiente tarea. Revisa la consola.",
				});
			} finally {
				setIsTaskLoading(false);
				// 🔥 CRÍTICO: Resetear estado de envío cuando termina de cargar
				setIsSendingCampaign(false);
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

	// FUNCIÓN 1: Generar el borrador (Preview manual)
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
					message: "El borrador ha sido generado exitosamente.",
				});
			} catch (err) {
				console.error("Error al generar el borrador:", err);
				setNotification({
					type: "error",
					title: "Error al Generar",
					message: "No se pudo generar el borrador. Verifica la conexión.",
				});
			} finally {
				setIsPreviewLoading(false);
			}
		},
		[selectedOrg, selectedCampaignId, setNotification]
	);

	// FUNCIÓN 2.1: Lógica REAL de envío
	const _executeConfirmAndSend = useCallback(
		async (finalContent) => {
			setIsSendingCampaign(true);
			
			// 🔥 CRÍTICO: Usamos refs como fallback si los estados están null
			const orgForPayload = selectedOrg || pendingOrgRef.current;
			const taskForPayload = currentTask || pendingTaskRef.current;
			
			if (!orgForPayload) {
				console.error("❌ No hay organización disponible para envío");
				setNotification({
					type: "error",
					title: "Error",
					message: "No se pudo identificar la organización. Intenta recargar.",
				});
				setIsSendingCampaign(false);
				return;
			}
			
			const orgIdForPayload = orgForPayload.id;
			const orgNameForNotification = orgForPayload.organizacion || orgForPayload.nombre;
			const taskInfoForPayload = taskForPayload?.taskInfo;
			
			console.log("📧 Enviando mail a:", orgNameForNotification, "ID:", orgIdForPayload);
			
			try {
				const payload = {
					organizationId: orgIdForPayload,
					subject: finalContent.subject,
					body: finalContent.body,
					...(taskInfoForPayload && { taskInfo: taskInfoForPayload }),
					campaignId: selectedCampaignId || undefined,
					sentAt: new Date().toISOString(),
					updateHaceDias: true,
				};

				const response = await apiClient.confirmAndSend(payload);
				let result = response.data;

				if (typeof result === "string") {
					try { result = JSON.parse(result); } catch (e) {}
				}

				if (result && result.status === "success") {
					setNotification({
						type: "success",
						title: "Enviado",
						message: `Correo enviado a ${orgNameForNotification}.`,
					});

                    // --- LÓGICA CRÍTICA DE SEGUIMIENTO ---
					if (isCallCenterMode && currentQueueId) {
                    console.log("🔄 Mail enviado. Iniciando transición a siguiente tarea...");

                    // 1. LIMPIAR SOLO DATOS DE LA TAREA, NO LA ORGANIZACIÓN (para que el modal no se cierre)
                    setEmailPreview(null);
                    setCurrentTask(null);
                    // ❌ ELIMINADO: setSelectedOrg(null);  <-- ESTO CERRABA EL MODAL
                    
                    // 2. ACTIVAR UI DE CARGA INMEDIATAMENTE
                    setIsTaskLoading(true); // Esto forzará al Modal a mostrar el Spinner

                    // 3. Esperar los 4 segundos para DynamoDB (GSI Consistency)
                    setTimeout(() => {
                        fetchNextTask(currentQueueId);
                    }, 4000); 
                } else {
                    // Si NO es Call Center, aquí sí cerramos todo
                    setIsSendingCampaign(false);
                    handleRefresh();
                    setShowCampaignModal(false);
                    setEmailPreview(null);
                }
            
				} else if (result && result.status === "canceled") {
					setNotification({
						type: "warning",
						title: "Cancelado",
						message: result.message || "Envío cancelado.",
					});
					setIsSendingCampaign(false);
				} else {
					throw new Error(result?.status || "Respuesta desconocida");
				}
			} catch (err) {
				console.error("Error al enviar:", err);
				setNotification({
					type: "error",
					title: "Error de Envío",
					message: "No se pudo enviar el correo. Inténtalo de nuevo.",
				});
				setIsSendingCampaign(false); // ⬅️ Siempre resetear en error
			}
			// 🔥 NOTA: Ya no necesitamos finally aquí porque se resetea en fetchNextTask
		},
		[selectedOrg, currentTask, setNotification, selectedCampaignId, isCallCenterMode, currentQueueId, fetchNextTask, handleRefresh, setShowCampaignModal]
	);

	const handleConfirmAndSend = useCallback(
		(finalContent) => {
			// 🔥 Usamos ref como fallback
			const orgForConfirm = selectedOrg || pendingOrgRef.current;
			
			setConfirmProps({
				show: true,
				title: "Confirmar Envío",
				message: `¿Enviar correo a ${orgForConfirm?.organizacion || orgForConfirm?.nombre || 'esta organización'}?`,
				confirmText: "Enviar",
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
				if (!selectedCampaignId) throw new Error("Falta campaña.");

				const orgIds = selectedOrgs.map((org) => org.id);
                
                const clientGeneratedQueueId = `q_${Date.now()}`;

                console.log("🔑 Fijando QueueID Cliente:", clientGeneratedQueueId);

				await apiClient.createDynamicQueue(
                    orgIds, 
                    clientGeneratedQueueId 
                );
				
				setCurrentQueueId(clientGeneratedQueueId);
				setIsCallCenterMode(true);
                
                console.log("⏳ Esperando 4 segundos para inicializar cola...");
                setTimeout(() => {
				    fetchNextTask(clientGeneratedQueueId);
                }, 4000); // ⬅️ Aumentado a 4 segundos

			} catch (err) {
				console.error("Error start CC:", err);
				setNotification({
					type: "error",
					title: "Error al Iniciar",
					message: err.message || "No se pudo iniciar la cola.",
				});
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
					title: "Falta Campaña",
					message: "Selecciona una campaña primero.",
				});
				return;
			}
			if (!selectedOrgs || selectedOrgs.length < 2) {
				setNotification({
					type: "warning",
					title: "Selección",
					message: "Selecciona al menos 2 organizaciones.",
				});
				return;
			}
			setConfirmProps({
				show: true,
				title: "Modo Call Center",
				message: `¿Iniciar cola con ${selectedOrgs.length} organizaciones?`,
				confirmText: "Iniciar",
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