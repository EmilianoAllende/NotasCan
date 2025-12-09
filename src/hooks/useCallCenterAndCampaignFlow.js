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
	// State
	const [emailPreview, setEmailPreview] = useState(null);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [isSendingCampaign, setIsSendingCampaign] = useState(false);
	const [isCallCenterMode, setIsCallCenterMode] = useState(false);
	const [isTaskLoading, setIsTaskLoading] = useState(false);
	const [currentQueueId, setCurrentQueueId] = useState(null);
	const [currentTask, setCurrentTask] = useState(null);
	
	// 🔥 Refs para evitar race conditions y manejar estado entre renderizados
	const pendingOrgRef = useRef(null);
	const pendingTaskRef = useRef(null);

	// --- 1. ABRIR MODAL (MODO INDIVIDUAL) ---
	const handleOpenCampaignModal = useCallback(
		(org) => {
            // 🔥 LIMPIEZA CRÍTICA: Borrar referencias de la cola anterior (Datos Fantasma)
            pendingOrgRef.current = null;
            pendingTaskRef.current = null;

			setSelectedOrg(org);
			setEmailPreview(null);
			setCurrentTask(null);
			setIsCallCenterMode(false);
			setShowCampaignModal(true);
		},
		[setSelectedOrg, setShowCampaignModal]
	);

	// --- 2. OBTENER SIGUIENTE TAREA (MODO CALL CENTER) ---
	const fetchNextTask = useCallback(
		async (queueId) => {
			console.log("🔄 Iniciando fetchNextTask con QueueID:", queueId);
			
			// Forzamos UI de carga inmediata
			setIsTaskLoading(true); 
			setShowCampaignModal(true); 
			setEmailPreview(null);
			setCurrentTask(null);
			
			const campaignId = selectedCampaignId;
			const CURRENT_USER_ID = currentUser?.usuario || "user_default";

			try {
				if (!queueId) throw new Error("Falta queueId activo.");

				// Llamada a API
				const taskResponse = await apiClient.getNextInQueue(
					queueId,
					CURRENT_USER_ID,
                    campaignId 
				);

				console.log("📦 Respuesta n8n (Raw):", taskResponse.data);

				// Normalización de datos
				const responseData = Array.isArray(taskResponse.data) ? taskResponse.data[0] : taskResponse.data;
				const taskData = responseData?.json || responseData;

				if (taskData && taskData.organization) {
					const organization = taskData.organization;
					
					// Normalización: Asegurar que tenga nombre
					if (!organization.nombre && organization.organizacion) {
						organization.nombre = organization.organizacion;
					}
					
					// Guardamos en refs ANTES de setear estados
					pendingOrgRef.current = organization;
					pendingTaskRef.current = taskData;

					// Establecer Organización y Tarea
					setCurrentTask(taskData);
					setSelectedOrg(organization);

                    // Gestión del Email (Preview)
                    let emailData = taskData.email || taskData.json?.email;

                    if (emailData && typeof emailData === 'object' && emailData.subject && emailData.body) {
                        setEmailPreview(emailData);
                    } else if (emailData && typeof emailData === 'string') {
                        // Fallback si viene como string
                        const payload = {
                            organization: organization,
                            campaignId: campaignId,
                        };
                        const emailResponse = await apiClient.generatePreview(payload);
                        setEmailPreview(emailResponse.data);
                    } else {
                        // Fallback total
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
				setIsSendingCampaign(false);
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

	// --- 3. GENERAR PREVIEW (MODO INDIVIDUAL - MANUAL) ---
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
                // 🔥 NORMALIZACIÓN DE DATOS (Modo Individual)
                // Limpiamos los datos "sucios" que puedan venir de la vista de lista (arrays, comillas, etc.)
                
                // 1. Limpieza del nombre de contacto
                let rawContact = organization.nombre_contacto || organization.nombres_org || organization.contacto || "";
                if (Array.isArray(rawContact)) rawContact = rawContact[0]; 
                if (typeof rawContact === 'string') {
                    rawContact = rawContact.replace(/[[\]"]/g, '').trim(); 
                }

                const safeOrg = {
                    ...organization,
                    // Aseguramos propiedades clave para n8n
                    organizacion: organization.organizacion || organization.nombre || "Empresa",
                    nombre: organization.nombre || organization.organizacion || "Empresa",
                    nombre_contacto: rawContact, 
                    id: organization.id || "unknown"
                };

				const payload = {
					organization: safeOrg,
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

	// --- 4. CONFIRMAR Y ENVIAR (LÓGICA REAL) ---
	const _executeConfirmAndSend = useCallback(
		async (finalContent) => {
			setIsSendingCampaign(true);
			
			// Usamos refs como fallback si los estados están null
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
                    
                    // 🔥 NUEVO: Enviamos remitente para enrutamiento y firma
                    senderEmail: finalContent.senderEmail,
                    senderName: finalContent.senderName,

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

                    // --- LÓGICA DE TRANSICIÓN ---
					if (isCallCenterMode && currentQueueId) {
                        console.log("🔄 Mail enviado. Esperando 4 segundos antes de cargar siguiente...");
                        
                        // Limpiamos datos de tarea PERO NO la organización (para mantener el modal abierto)
                        setEmailPreview(null);
                        setCurrentTask(null);
                        // ❌ NO HACER: setSelectedOrg(null);
                        
                        setIsTaskLoading(true); // Forzamos spinner

                        setTimeout(() => {
						    fetchNextTask(currentQueueId);
                        }, 4000); 
					} else {
                        // Modo Individual: Cerramos todo
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
				setIsSendingCampaign(false);
			}
		},
		[selectedOrg, currentTask, setNotification, selectedCampaignId, isCallCenterMode, currentQueueId, fetchNextTask, handleRefresh, setShowCampaignModal]
	);

    const handleSkipTask = useCallback(async () => {
        if (!currentQueueId) {
            console.warn("⚠️ No hay cola activa para saltar.");
            return;
        }

        console.log("⏭️ Saltando tarea actual...");
        const orgToSkip = selectedOrg || pendingOrgRef.current;
        
        // 1. UI Feedback inmediato: Limpiar vista
        setIsTaskLoading(true);
        setEmailPreview(null);
        setCurrentTask(null);

        try {
            // 2. (Opcional) Llamar API para penalizar el score en DynamoDB
            if (orgToSkip?.id) {
                // No esperamos el await para no bloquear la UI, se hace en background
                apiClient.skipTask(currentQueueId, orgToSkip.id, selectedCampaignId);
            }
            
            // 3. Buscar la siguiente tarea inmediatamente
            // Damos un pequeño delay de 1s para que se sienta la transición
            setTimeout(() => {
                fetchNextTask(currentQueueId);
            }, 1000);

        } catch (error) {
            console.error("Error al saltar tarea:", error);
            setIsTaskLoading(false); // Restaurar si falla muy grave
        }
    }, [currentQueueId, selectedOrg, selectedCampaignId, fetchNextTask]);

	const handleConfirmAndSend = useCallback(
		(finalContent) => {
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

	// --- 5. INICIAR MODO CALL CENTER ---
	const _executeStartCallCenterMode = useCallback(
		async (selectedOrgs) => {
			setIsTaskLoading(true);
			try {
				if (!selectedCampaignId) throw new Error("Falta campaña.");

				const orgIds = selectedOrgs.map((org) => org.id);
                const clientGeneratedQueueId = `q_${Date.now()}`;

				await apiClient.createDynamicQueue(
                    orgIds, 
                    clientGeneratedQueueId 
                );
				
				setCurrentQueueId(clientGeneratedQueueId);
				setIsCallCenterMode(true);
                
                console.log("⏳ Esperando 4 segundos para inicializar cola...");
                setTimeout(() => {
				    fetchNextTask(clientGeneratedQueueId);
                }, 4000);

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
        // --- ¡IMPORTANTE! AGREGAR ESTO AL RETURN ---
        handleSkipTask 
	};
};