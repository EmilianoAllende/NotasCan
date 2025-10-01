import axios from 'axios';

// RECORDAR MODIFICAR. Ahora n8n corre localmente, entonces uso 'http://localhost:5678'.
const N8N_BASE_URL = 'https://n8n.icc-e.org';

const apiClient = axios.create({
    baseURL: N8N_BASE_URL
});

// --- LISTADO DE ORGANIZACIONES DESDE DYNAMO ---
const GET_ORGANIZACIONES_PATH = '/webhook/573b9827-ad59-425f-9526-e2d16a7e2198';
// --- EDICIÓN DE ORGANIZACIONES EN DYNAMO ---
const UPDATE_ORGANIZACION_PATH = '/webhook/organizaciones';

// Función para OBTENER toda la lista de organizaciones.
apiClient.getOrganizaciones = () => {
    return apiClient.get(GET_ORGANIZACIONES_PATH);
};

// Con esto el nodo AWS recibe los datos del formulario y los envía vía PUT.
apiClient.updateOrganization = (formData) => {
    try {
        return apiClient.put(UPDATE_ORGANIZACION_PATH, formData);
    } catch (error) {
        console.error("Error al actualizar la organización:", error);
        throw error;
    }
};

// NUEVA FUNCIÓN para generar el borrador del email
apiClient.generatePreview = (payload) => {
    // payload esperado: { organization, campaign: { title, description, prompt, mode, id? } }
    try {
        // Llama al Workflow #1
        return apiClient.post('/webhook/generate-preview', payload);
    } catch (error) {
        console.error("Error al generar la previsualización:", error);
        throw error;
    }
};

// NUEVA FUNCIÓN para enviar el email ya aprobado
apiClient.confirmAndSend = (payload) => {
    // Payload esperado:
    // {
    //   organizationId: string,
    //   subject: string,
    //   body: string,
//? Opcionales para integración dinámica con campaigns_log y compatibilidad con 'hace_dias'
    //   campaignId?: string,     // id de la plantilla usada (para actualizar campaigns_log[campaignId])
    //   sentAt?: string,         // ISODate del envío (para cálculo de hace_dias en backend)
    //   updateHaceDias?: boolean // si true, el backend debe actualizar el campo raíz 'hace_dias'
    // }
    try {
        // Llama al Workflow #2
        return apiClient.post('/webhook/confirm-and-send', payload);
    } catch (error) {
        console.error("Error al confirmar y enviar la campaña:", error);
        throw error;
    }
};

// PREPARADO: historial de campañas (por tipo y fecha). Endpoint placeholder para cuando exista en el back.
apiClient.getCampaignsHistory = () => {
    // Espera que el backend exponga este webhook con estructura adecuada.
    return apiClient.get('/webhook/campaigns-history');
};

// La función 'sendCampaign' ya no es necesaria y puede ser eliminada.

export default apiClient;
