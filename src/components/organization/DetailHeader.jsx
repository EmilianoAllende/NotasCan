// src/components/organization/DetailHeader.jsx

import React from "react";
import { ExternalLink } from "lucide-react";

const DetailHeader = ({ selectedOrg, orgInfo, StatusBadge }) => (
	<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
		<div className="flex flex-wrap items-start justify-between gap-4 mb-4">
			<div>
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{selectedOrg.organizacion || selectedOrg.nombre}
				</h2>
				<p className="text-gray-600 dark:text-gray-400">{selectedOrg.id}</p>
			</div>
			{StatusBadge && <StatusBadge estado={selectedOrg.estado_cliente} />}
		</div>
		<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
			<div>
				<p className="text-sm text-gray-500 dark:text-gray-400">Municipio</p>
				<p className="font-medium dark:text-gray-200">
					{selectedOrg.municipio || "No especificado"}
				</p>
			</div>
			<div>
				<p className="text-sm text-gray-500 dark:text-gray-400">Isla</p>
				<p className="font-medium dark:text-gray-200">
					{selectedOrg.isla || "No especificado"}
				</p>
			</div>
			<div>
				<p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
				<p className="font-medium dark:text-gray-200">
					{orgInfo.tipo || "Sin clasificar"}
				</p>
			</div>
			<div className="col-span-2">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Actividad Principal
				</p>
				<p className="font-medium dark:text-gray-200">
					{selectedOrg.actividad_principal ||
						orgInfo.actividad_principal ||
						"No especificado"}
				</p>
			</div>
			<div>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Fecha de Creación
				</p>
				<p className="font-medium dark:text-gray-200">
					{selectedOrg.created_date
						? new Date(selectedOrg.created_date).toLocaleDateString()
						: "No especificada"}
				</p>
			</div>
			{selectedOrg.url && selectedOrg.url !== "indefinido" && (
				<div className="col-span-2">
					<p className="text-sm text-gray-500 dark:text-gray-400">Sitio Web</p>
					<a
						href={selectedOrg.url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 hover:underline">
						{selectedOrg.url} <ExternalLink size={14} />
					</a>
				</div>
			)}
		</div>
	</div>
);

export default DetailHeader;
