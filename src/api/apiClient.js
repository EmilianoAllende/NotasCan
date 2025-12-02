import axios from "axios";

const N8N_BASE_URL = "https://n8n.icc-e.org";

const apiClient = axios.create({
	baseURL: N8N_BASE_URL,
});

// --- Interceptor para Logs de Depuración ---
apiClient.interceptors.request.use((request) => {
	console.groupCollapsed(
		`🚀 API Request: ${request.method.toUpperCase()} ${request.url}`
	);
	console.log("URL Completa:", request.baseURL + request.url);
	console.log("Headers:", request.headers);

	if (request.data) {
		console.log("📦 Body (Datos enviados):", request.data);
	}

	if (request.params) {
		console.log("🔍 Query Params:", request.params);
	}

	console.groupEnd();
	return request;
});

// --- LISTADO DE ORGANIZACIONES DESDE DYNAMO ---s
const GET_ORGANIZACIONES_PATH = "/webhook/organization-list";
// --- EDICIÓN DE ORGANIZACIONES EN DYNAMO ---
const UPDATE_ORGANIZACION_PATH = "/webhook/organizaciones";

// --- ENDPOINTS DE PLANTILLAS (NUEVOS) ---
const TEMPLATES_PATH = "/webhook/templates"; // Endpoint del flujo TemplateManager
const GENERATE_PREVIEW_PATH = "/webhook/generate-preview"; // Endpoint del flujo MailWriter
const CONFIRM_SEND_PATH = "/webhook/confirm-and-send-test";


apiClient.getTemplates = () => {
	return apiClient.post(TEMPLATES_PATH, { action: "GET" });
};

apiClient.saveTemplate = (templateData) => {
	return apiClient.post(TEMPLATES_PATH, {
		action: "SAVE",
		payload: templateData,
	});
};

apiClient.deleteTemplate = (templateId) => {
	return apiClient.post(TEMPLATES_PATH, {
		action: "DELETE",
		payload: { id: templateId },
	});
};

apiClient.getOrganizaciones = () => {
	return apiClient.post(GET_ORGANIZACIONES_PATH, {});
};

apiClient.updateOrganization = (formData) => {
	return apiClient.put(UPDATE_ORGANIZACION_PATH, formData).catch((error) => {
		console.error("Error al actualizar la organización:", error);
		throw error;
	});
};

// === FUNCIONES DE CAMPAÑAS ===

apiClient.generatePreview = (payload) => {
	return apiClient.post(GENERATE_PREVIEW_PATH, payload).catch((error) => {
		console.error("Error al generar la previsualización:", error);
		throw error;
	});
};

apiClient.confirmAndSend = (payload) => {
	return apiClient.post(CONFIRM_SEND_PATH, payload).catch((error) => {
		console.error("Error al confirmar y enviar la campaña:", error);
		throw error;
	});
};

apiClient.getCampaignsHistory = () => {
	return apiClient.get("/webhook/campaigns-history").catch((error) => {
		console.error("Error al obtener el historial de campañas:", error);
		throw error;
	});
};

// Crear una cola dinámica a partir de una lista de IDs
apiClient.createDynamicQueue = (orgIds, queueId) => {
	// Enviamos el ID generado por el frontend
	return apiClient.post("/webhook/create-dynamic-queue-test", { 
        orgIds, 
        queueId 
    });
};

// Obtener el siguiente item
apiClient.getNextInQueue = (queueId, userId, campaignId) => {
    // Usamos 'params' de axios para manejar la query string automáticamente
    // Aseguramos enviar campaignId que faltaba antes
	return apiClient.get("/webhook/siguiente-correo-test", {
		params: {
            queueId,
            userId,
            campaignId
        }
	});
};

// --- ACCIONES DE COLA ---
apiClient.skipTask = (queueId, organizationId, campaignId) => {
    // Asumimos que crearás un endpoint en n8n para registrar el "salto"
    // Si no tienes endpoint aún, el frontend funcionará pero la tarea podría volver a salir
    return apiClient.post("/webhook/skip-task-log", { 
        queueId, 
        organizationId,
        campaignId 
    }).catch(err => console.warn("No se pudo registrar el skip en backend:", err));
};


apiClient.login = (usuario, password) => {
	return apiClient.post("/webhook/notascan-login", { usuario, password });
};

apiClient.createUser = (usuario, password, rol, token) => {
	return apiClient.post(
		"/webhook/create-user",
		{ usuario, password, rol }, // El body que recibe n8n
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
};

export default apiClient;