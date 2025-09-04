import axios from 'axios';

// RECORDAR MODIFICAR. Ahora n8n corre localmente, entonces uso 'http://localhost:5678'.
const N8N_BASE_URL = 'http://localhost:5678';


const apiClient = axios.create({
    baseURL: N8N_BASE_URL
});


const GET_ORGANIZACIONES_PATH = '/webhook/573b9827-ad59-425f-9526-e2d16a7e2198';
const UPDATE_ORGANIZACION_PATH = '/webhook/organizaciones'; // Usar el mismo endpoint


//Función para OBTENER toda la lista de organizaciones.
apiClient.getOrganizaciones = () => {
    return apiClient.get(GET_ORGANIZACIONES_PATH);
};

// Con esto el nodo AWS recibe los datos del formulario y los envía vía PUT (consejo IA).
apiClient.updateOrganization = (formData) => {
    try {
        return apiClient.put(UPDATE_ORGANIZACION_PATH, formData);
    } catch (error) {
        console.error("Error al actualizar la organización:", error);
// "throw" es para PROPAGAR el error para que el componente que lo llama pueda manejarlo.
        throw error;
    }
};

export default apiClient;