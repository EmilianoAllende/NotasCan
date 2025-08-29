import axios from 'axios';

// Configuración base para la API - RECORDAR MODIFICAR
const apiClient = axios.create({
    baseURL: 'http://localhost:5678' 
});

export default apiClient;