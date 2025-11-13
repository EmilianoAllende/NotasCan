// src/components/organization/ActivityAndTopics.jsx

import React from "react";
import { ExternalLink } from "lucide-react";

const ActivityAndTopics = ({ selectedOrg, orgInfo }) => (
	<>
		<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
			<h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
				Actividad Comunicacional
			</h3>
			<div className="space-y-4">
				<div className="flex justify-between">
					<span className="dark:text-gray-300">Frecuencia:</span>
					<span className="font-medium dark:text-gray-200">
						{selectedOrg.frecuencia_comunicacion &&
						selectedOrg.frecuencia_comunicacion !== "indefinido"
							? selectedOrg.frecuencia_comunicacion
							: selectedOrg.frecuencia &&
							  selectedOrg.frecuencia !== "indefinido"
							? selectedOrg.frecuencia
							: "N/A"}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="dark:text-gray-300">Último posteo:</span>
					<span className="font-medium dark:text-gray-200">
						{selectedOrg.ultimo_posteo || "No registrado"}
					</span>
				</div>
				{selectedOrg.titulo_posteo &&
					selectedOrg.titulo_posteo !== "indefinido" && (
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Título del último posteo
							</p>
							<p className="font-medium dark:text-gray-200">
								{selectedOrg.titulo_posteo}
							</p>
							{selectedOrg.url_posteo &&
								selectedOrg.url_posteo !== "indefinido" && (
									<a
										href={selectedOrg.url_posteo}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1 mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
										Ver posteo <ExternalLink size={14} />
									</a>
								)}
						</div>
					)}
				<div className="flex items-center justify-between">
					<span className="dark:text-gray-300">Suscripción:</span>
					<span
						className={`px-2 py-1 text-xs font-semibold rounded-full ${
							selectedOrg.suscripcion === "activa"
								? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
								: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
						}`}>
						{selectedOrg.suscripcion || "No especificada"}
					</span>
				</div>
			</div>
		</div>

		<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
			<h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
				Temas Principales (Intereses)
			</h3>
			<div className="flex flex-wrap gap-2">
				{orgInfo.intereses?.length > 0 ? (
					orgInfo.intereses.map((tema, index) => (
						<span
							key={index}
							className="inline-block px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
							{tema}
						</span>
					))
				) : (
					<p className="italic text-gray-500 dark:text-gray-400">
						Análisis pendiente
					</p>
				)}
			</div>
		</div>
	</>
);

export default ActivityAndTopics;
