// Utilidades para el manejo de organizaciones, por una cuestión de modularización.

/**
 * Extrae el tipo de entidad del metadata de una organización
 * @param {Object} org - Objeto de organización
 * @returns {string} - Tipo de entidad o string vacío
 */
export const getEntityType = (org) => {
	// Priorizar el campo directo tipo_entidad si existe
	if (org.tipo_entidad) {
		return org.tipo_entidad;
	}

	// Fallback al metadata si no existe tipo_entidad
	try {
		if (typeof org.metadata === "string" && org.metadata !== "indefinido") {
			const parsedMeta = JSON.parse(org.metadata);
			return parsedMeta?.organizacion?.tipo || "";
		}
	} catch (e) {
		// Ignorar errores de parseo
	}
	return "";
};
export const TIPOS_ENTIDAD = {
	SECTOR_PUBLICO_CANARIO: "sector_publico_canario",
	EMPRESAS: "empresas",
	ASOCIACIONES: "asociaciones",
};

export const SUBTIPOS_POR_ENTIDAD = {
	[TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO]: [
		"delegacion_en_canarias_de_administracion_central",
		"administracion_autonomica_canaria",
		"cabildos_insulares",
		"ayuntamientos",
		"mancomunidades",
		"organismos_autonomos",
		"empresas_publicas_canarias",
		"consorcios_publicos_canarios",
		"fuerzas_y_cuerpos_de_seguridad_en_canarias",
		"otros",
	],
	[TIPOS_ENTIDAD.EMPRESAS]: [
		"hosteleria_y_turismo",
		"transporte_y_logistica",
		"energia_y_utilities",
		"construccion_e_inmobiliario",
		"comercio_y_distribucion",
		"alimentacion_y_bebidas",
		"servicios_profesionales",
		"tecnologia_y_comunicaciones",
		"industria_y_manufactura",
		"banca_y_seguros",
		"comunicacion_y_marketing",
		"ocio_y_entretenimiento",
		"educacion_privada",
		"sanidad_privada",
		"deporte_profesional",
		"otros",
	],
	[TIPOS_ENTIDAD.ASOCIACIONES]: [
		"organizaciones_empresariales",
		"sindicatos",
		"partidos_politicos",
		"colegios_profesionales",
		"federaciones_deportivas",
		"asociaciones_culturales",
		"entidades_medioambientales",
		"organizaciones_sociales",
		"fundaciones",
		"cofradias_y_hermandades",
		"asociaciones_vecinales",
		"ongs_y_cooperacion",
		"plataformas_ciudadanas",
		"asociaciones_profesionales",
		"entidades_religiosas",
		"otros",
	],
};
/* Constantes para estados de cliente */
export const ESTADOS_CLIENTE = {
	PENDIENTE: undefined || null || 0, // "sin clasificar"
	LISTA_BLANCA: 1, // "blanca canarias"
	LISTA_NEGRA: 2, // "negra"
	LISTA_BLANCA_NACIONAL: 3, // "Nacional"
	OTRO_TIPO: 4, // "otro tipo"
	COMPETENCIA: 5, // "competencia"
	REVISION: 6, // "revision"
	CONTACTOS_BODY: 7, // "contactos_body"
};
/**
 * Obtiene el label del estado
 * @param {number} estado - Estado numérico
 * @returns {string} - Label del estado
 */
export const getEstadoLabel = (estado) => {
	switch (estado) {
		case ESTADOS_CLIENTE.LISTA_BLANCA:
			return "Lista Blanca";
		case ESTADOS_CLIENTE.LISTA_NEGRA:
			return "Lista Negra";
		case ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL:
			return "Lista Blanca Nacional";
		case ESTADOS_CLIENTE.OTRO_TIPO:
			return "Otro Tipo";
		case ESTADOS_CLIENTE.COMPETENCIA:
			return "Con Competencia";
		case ESTADOS_CLIENTE.REVISION:
			return "Revision";
		case ESTADOS_CLIENTE.CONTACTOS_BODY:
			return "Contactos del body";
		case ESTADOS_CLIENTE.PENDIENTE:
			return "Pendiente";
		default:
			return "No definidos";
	}
};
