// src/components/organization/OrganizationTableRow.jsx
import React from "react";
import { Eye, Edit, Mail } from "lucide-react";
import StatusBadge from "../common/StatusBadge"; // Importamos el badge

const OrganizationTableRow = ({
	org,
	selected,
	handleSelectOrg,
	getDisplayContacts,
	ESTADOS_CLIENTE,
	setSelectedOrg,
	viewDetail,
	openEditModal,
	handleCampaignClick,
}) => {
	const { display, more } = getDisplayContacts(org);

	return (
		<tr
			className={`transition-colors duration-150 ${
				selected
					? "bg-blue-50 dark:bg-blue-900/20"
					: "hover:bg-gray-50 dark:hover:bg-gray-800/60"
			}`}>
			{/* Checkbox */}
			<td className="py-3 pl-4 pr-2">
				<input
					type="checkbox"
					className="h-4 w-4 rounded border-gray-300 text-blue-600 dark:border-gray-500 dark:bg-gray-700"
					checked={selected}
					onChange={() => handleSelectOrg(org.id)}
				/>
			</td>

			{/* Organización */}
			<td className="py-3 px-3 text-gray-900 dark:text-gray-100 font-medium">
				<div className="flex items-center">
					<span
						className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${
							org.estado_cliente === ESTADOS_CLIENTE.COMPLETADO
								? "bg-green-500"
								: org.estado_cliente === ESTADOS_CLIENTE.EN_REVISION
								? "bg-yellow-400"
								: "bg-gray-400"
						}`}
					/>
					<span className="truncate max-w-[180px]">
						{org.organizacion || org.nombre || "Sin nombre"}
					</span>
				</div>
				<div className="text-xs text-gray-500 dark:text-gray-400">
					{org.sector || "Sin sector"}
				</div>
			</td>

			{/* Contacto */}
			<td className="py-3 px-3 text-gray-700 dark:text-gray-300">
				{display.map((contact, i) => (
					<div key={i} className="truncate">
						{contact}
					</div>
				))}
				{more > 0 && (
					<div className="text-xs text-gray-400 italic mt-1">+{more} más</div>
				)}
			</td>

			{/* Estado */}
			<td className="py-3 px-3">
				<StatusBadge estado={org.estado_cliente} />
			</td>

			{/* Último contacto */}
			<td className="py-3 px-3 text-gray-600 dark:text-gray-400">
				{org.ultimo_contacto
					? new Date(org.ultimo_contacto).toLocaleDateString()
					: "Nunca"}
				{org.hace_dias != null && (
					<div className="text-xs text-gray-400">Hace {org.hace_dias} días</div>
				)}
			</td>

			{/* Acciones */}
			<td className="py-3 px-3 text-right">
				<div className="flex justify-end space-x-2">
					<button
						onClick={() => {
							setSelectedOrg(org);
							viewDetail(org);
						}}
						className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/40"
						title="Ver detalles">
						<Eye className="h-4 w-4" />
					</button>
					<button
						onClick={() => {
							setSelectedOrg(org);
							openEditModal(org);
						}}
						className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
						title="Editar">
						<Edit className="h-4 w-4" />
					</button>
					<button
						onClick={() => handleCampaignClick(org)}
						className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/40"
						title="Enviar campaña">
						<Mail className="h-4 w-4" />
					</button>
				</div>
			</td>
		</tr>
	);
};

export default OrganizationTableRow;
