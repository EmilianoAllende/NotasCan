import axios from 'axios';

// Configuración base para la API
const apiClient = axios.create({
    baseURL: 'http://localhost:5678' 
});

export default apiClient;