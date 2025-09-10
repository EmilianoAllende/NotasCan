import axios from 'axios';

// RECORDAR MODIFICAR. Ahora n8n corre localmente, entonces uso 'http://localhost:5678'.
const N8N_BASE_URL = 'http://localhost:5678';

const apiClient = axios.create({
    baseURL: N8N_BASE_URL
});

// --- LISTADO DE ORGANIZACIONES DESDE DYNAMO ---
const GET_ORGANIZACIONES_PATH = '/webhook/573b9827-ad59-425f-9526-e2d16a7e2198';
// --- EDICIÓN DE ORGANIZACIONES EN DYNAMO ---
const UPDATE_ORGANIZACION_PATH = '/webhook/organizaciones';
// --- ENVÍO DE CAMPAÑAS ---
// const SEND_CAMPAIGN_PATH = '/webhook/send-campaign';
const SEND_CAMPAIGN_PATH = '/webhook/send-campaign';

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

// Envía la Organización y el Tipo de campaña a n8n.
apiClient.sendCampaign = (organization, campaignType) => {
    try {
        const payload = {
            organization,
            campaignType
        };
// POST.
        return apiClient.post(SEND_CAMPAIGN_PATH, payload);
    } catch (error) {
        console.error("Error al iniciar el envío de la campaña:", error);
        throw error;
    }
};

export default apiClient;
