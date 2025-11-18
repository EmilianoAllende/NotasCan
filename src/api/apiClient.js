import axios from "axios";

// Apuntamos a "/" para que React use el "proxy" definido en package.json
const N8N_BASE_URL = "https://n8n.icc-e.org";

const apiClient = axios.create({
	baseURL: N8N_BASE_URL,
});
// ------------------------------------


// --- ¡NUEVO! Interceptor para Logs de Depuración ---
apiClient.interceptors.request.use(request => {
	console.groupCollapsed(`🚀 API Request: ${request.method.toUpperCase()} ${request.url}`);
	console.log('URL Completa:', request.baseURL + request.url);
	console.log('Headers:', request.headers);

	if (request.data) {
		console.log('📦 Body (Datos enviados):', request.data);
	}
	
	if (request.params) {
		console.log('🔍 Query Params:', request.params);
	}

	console.groupEnd();
	return request;
});


// --- LISTADO DE ORGANIZACIONES DESDE DYNAMO ---
const GET_ORGANIZACIONES_PATH = "/webhook/573b9827-ad59-425f-9526-e2d16a7e2198"; // Endpoint de DynamoDB
// --- EDICIÓN DE ORGANIZACIONES EN DYNAMO ---
const UPDATE_ORGANIZACION_PATH = "/webhook/organizaciones";

// --- ENDPOINTS DE PLANTILLAS (NUEVOS) ---
const TEMPLATES_PATH = "/webhook/templates"; // Endpoint del flujo TemplateManager
const GENERATE_PREVIEW_PATH = "/webhook/generate-preview"; // Endpoint del flujo MailWriter
const CONFIRM_SEND_PATH = "/webhook/confirm-and-send";

// Obtiene TODAS las plantillas de prompts desde Supabase.*/
apiClient.getTemplates = () => {
	return apiClient.post(TEMPLATES_PATH, { action: "GET" });
};

/*** Guarda o actualiza una plantilla en Supabase (Usa el Upsert).*
//  *  @param {object} templateData - El objeto completo de la plantilla.*/
apiClient.saveTemplate = (templateData) => {
	return apiClient.post(TEMPLATES_PATH, { 
		action: "SAVE", 
		payload: templateData 
	});
};

/**
 * Borra una plantilla de Supabase usando su ID.
//  * @param {string} templateId - El ID de la plantilla.
 */
apiClient.deleteTemplate = (templateId) => {
	return apiClient.post(TEMPLATES_PATH, { 
    action: "DELETE", 
    payload: { id: templateId } 
  });
};

// Función para OBTENER toda la lista de organizaciones.
apiClient.getOrganizaciones = () => {
	return apiClient.get(GET_ORGANIZACIONES_PATH);
};

// Con esto el nodo AWS recibe los datos del formulario y los envía vía PUT.
apiClient.updateOrganization = (formData) => {
	return apiClient.put(UPDATE_ORGANIZACION_PATH, formData).catch((error) => {
		console.error("Error al actualizar la organización:", error);
		throw error;
	});
};

// === FUNCIONES DE CAMPAÑAS (MODIFICADO) ===

/**
 * Genera el borrador del email.
 * Llama al flujo MailWriter, que ahora construye el prompt.
 * @param {object} payload - Espera { organization, campaignId }
 */
apiClient.generatePreview = (payload) => {
	return apiClient.post(GENERATE_PREVIEW_PATH, payload).catch((error) => {
		console.error("Error al generar la previsualización:", error);
		throw error;
	});
};

// Confirma y envía el email ya aprobado
apiClient.confirmAndSend = (payload) => {
	return apiClient.post(CONFIRM_SEND_PATH, payload).catch((error) => {
		console.error("Error al confirmar y enviar la campaña:", error);
		throw error;
	});
};

// PREPARADO: historial de campañas (por tipo y fecha). Endpoint placeholder para cuando exista en el back.
apiClient.getCampaignsHistory = () => {
	// Espera que el backend exponga este webhook con estructura adecuada.
	return apiClient.get("//webhook/campaigns-history").catch((error) => {
		console.error("Error al obtener el historial de campañas:", error);
		throw error;
	});
};

// Crear una cola dinámica a partir de una lista de IDs
apiClient.createDynamicQueue = (orgIds) => {
	return apiClient.post("/webhook/create-dynamic-queue", { orgIds });
};

// Obtener el siguiente item de una cola específica (ya modificada para multiusuario)
apiClient.getNextInQueue = (queueId, userId) => {
	return apiClient.get(
		`/webhook/siguiente-correo?queueId=${queueId}&userId=${userId}`
	);
};

// --- ¡NUEVO! Función de Login ---
apiClient.login = (usuario, password) => {
	return apiClient.post("/webhook/login", { usuario, password });
};

// --- ¡NUEVO! Función de Crear Usuario (Admin) ---
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
// --- FIN DE NUEVAS FUNCIONES ---

export default apiClient;
