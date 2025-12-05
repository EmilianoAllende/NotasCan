import React from "react";

const ESTADOS_CLIENTE = {
	PENDIENTE: 0,
	LISTA_BLANCA: 1,
	LISTA_NEGRA: 2,
	LISTA_BLANCA_NACIONAL: 3,
	OTRO_TIPO: 4,
	COMPETENCIA: 5,
	REVISION: 6,
	CONTACTOS_BODY: 7,
};

const StatusBadge = ({ estado }) => {
	let text = "Pendiente";
	let color =
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";

	switch (estado) {
		case ESTADOS_CLIENTE.LISTA_BLANCA:
			text = "Lista Blanca";
			color =
				"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
			break;
		case ESTADOS_CLIENTE.LISTA_NEGRA:
			text = "Lista Negra";
			color = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
			break;
		case ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL:
			text = "Lista Blanca Nacional";
			color =
				"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
			break;
		case ESTADOS_CLIENTE.OTRO_TIPO:
			text = "Otro Tipo";
			color = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
			break;
		case ESTADOS_CLIENTE.COMPETENCIA:
			text = "Con Competencia";
			color =
				"bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
			break;
		case ESTADOS_CLIENTE.REVISION:
			text = "Revisión";
			color =
				"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
			break;
		case ESTADOS_CLIENTE.CONTACTOS_BODY:
			text = "Contactos Body";
			color =
				"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
			break;
		case ESTADOS_CLIENTE.PENDIENTE:
		default:
			text = "Pendiente";
			color =
				"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
			break;
	}

	return (
		<span
			className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full whitespace-nowrap ${color}`}>
			{text}
		</span>
	);
};

export default StatusBadge;