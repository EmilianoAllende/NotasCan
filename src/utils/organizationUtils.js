// Utilidades para el manejo de organizaciones, por una cuestión de modularización.

/**
 * Extrae el tipo de entidad del metadata de una organización
 * @param {Object} org - Objeto de organización
 * @returns {string} - Tipo de entidad o string vacío
 */
export const getEntityType = (org) => {
  try {
    if (typeof org.metadata === 'string' && org.metadata !== 'indefinido') {
      const parsedMeta = JSON.parse(org.metadata);
      return parsedMeta?.organizacion?.tipo || '';
    }
  } catch (e) { // Ignorar errores de parseo
  }
  return '';
};

/* Constantes para estados de cliente */
export const ESTADOS_CLIENTE = {
  COMPLETADO: 1,
  EN_REVISION: 2,
  PENDIENTE: 3
};

/**
 * Obtiene el label del estado
 * @param {number} estado - Estado numérico
 * @returns {string} - Label del estado
 */
export const getEstadoLabel = (estado) => {
  switch (estado) {
    case ESTADOS_CLIENTE.COMPLETADO:
      return 'Completado';
    case ESTADOS_CLIENTE.EN_REVISION:
      return 'En revisión';
    case ESTADOS_CLIENTE.PENDIENTE:
      return 'Pendiente';
    default:
      return 'Desconocido';
  }
};
