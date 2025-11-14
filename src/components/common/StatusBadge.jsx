// src/components/common/StatusBadge.jsx
import React from "react";

const StatusBadge = ({ estado }) => {
	let text = "Pendiente";
	let color = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

	// Asumiendo que 1 es 'En Revisión' y 2 es 'Completado'
	if (estado === 1) {
		text = "En revisión";
		color =
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
	} else if (estado === 2) {
		text = "Completado";
		color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
	}

	return (
		<span
			className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full ${color}`}>
			{text}
		</span>
	);
};

export default StatusBadge;
