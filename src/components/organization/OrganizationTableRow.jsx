// src/components/organization/OrganizationTableRow.jsx
import React from "react";
import { Eye, Edit, Mail } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

// Definición local de estados (debe coincidir con OrganizationFilters)
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

// --- ¡NUEVO! Función auxiliar para obtener el color ---
const getStatusColor = (estado) => {
	switch (estado) {
		case ESTADOS_CLIENTE.LISTA_BLANCA:
			return "bg-green-500"; // Verde
		case ESTADOS_CLIENTE.LISTA_NEGRA:
			return "bg-red-500"; // Rojo
		case ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL:
			return "bg-blue-500"; // Azul
		case ESTADOS_CLIENTE.OTRO_TIPO:
			return "bg-gray-500"; // Gris
		case ESTADOS_CLIENTE.COMPETENCIA:
			return "bg-indigo-500"; // Índigo
		case ESTADOS_CLIENTE.REVISION:
			return "bg-orange-500"; // Naranja
		case ESTADOS_CLIENTE.CONTACTOS_BODY:
			return "bg-purple-500"; // Morado
		case ESTADOS_CLIENTE.PENDIENTE:
			return "bg-yellow-400"; // Amarillo (Default)
		default:
			return "bg-red-400"; // Amarillo (Default)
	}
};

const OrganizationTableRow = ({
	org,
	selected,
	handleSelectOrg,
	getDisplayContacts,
	setSelectedOrg,
	viewDetail,
	openEditModal,
	handleCampaignClick,
}) => {
	const { display, more } = getDisplayContacts(org);

	return (
		<tr
			className={`group transition-colors duration-150 ${
				selected
					? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500"
					: "hover:bg-gray-50 dark:hover:bg-gray-800/60 border-l-4 border-l-transparent"
			}`}>
			{/* Checkbox */}
			<td className="py-4 pl-4 pr-3 sm:pl-6 align-middle">
				<div className="flex items-center h-full">
					<input
						type="checkbox"
						className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-700 dark:checked:bg-blue-500 cursor-pointer transition-colors"
						checked={selected}
						onChange={() => handleSelectOrg(org.id)}
					/>
				</div>
			</td>

			{/* Organización */}
			<td className="py-4 px-3 align-middle">
				<div className="flex items-center gap-3">
					{/* --- USAMOS LA FUNCIÓN AUXILIAR AQUÍ --- */}
					<span
						className={`flex-shrink-0 w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white dark:ring-slate-800 ${getStatusColor(
							org.estado_cliente
						)}`}
						title={`Estado: ${org.estado_cliente}`}
					/>
					<div className="min-w-0">
						<div
							className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[220px]"
							title={org.organizacion || org.nombre}>
							{org.organizacion || org.nombre || "Sin nombre"}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[220px]">
							{org.sector || "Sin sector"}
						</div>
					</div>
				</div>
			</td>

			{/* Contacto */}
			<td className="py-4 px-3 align-middle text-gray-700 dark:text-gray-300 text-sm">
				<div className="flex flex-col gap-0.5">
					{display.map((contact, i) => (
						<div key={i} className="truncate max-w-[180px]" title={contact}>
							{contact}
						</div>
					))}
					{more > 0 && (
						<div className="text-xs text-gray-500 dark:text-gray-500 italic">
							+{more} más
						</div>
					)}
					{display.length === 0 && (
						<span className="text-gray-400 dark:text-gray-600 italic">
							Sin contacto
						</span>
					)}
				</div>
			</td>

			{/* Estado (Badge) */}
			<td className="py-4 px-3 align-middle">
				<StatusBadge estado={org.estado_cliente} />
			</td>

			{/* Último contacto */}
			<td className="py-4 px-3 align-middle text-gray-600 dark:text-gray-400 text-sm">
				<div>
					{org.ultimo_contacto
						? new Date(org.ultimo_contacto).toLocaleDateString()
						: "Nunca"}
				</div>
				{org.hace_dias != null && (
					<div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
						Hace {org.hace_dias} días
					</div>
				)}
			</td>

			{/* Acciones */}
			<td className="py-4 px-3 align-middle text-right">
				<div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<button
						onClick={() => {
							setSelectedOrg(org);
							viewDetail(org);
						}}
						className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
						title="Ver detalles">
						<Eye size={18} />
					</button>
					<button
						onClick={() => {
							setSelectedOrg(org);
							openEditModal(org);
						}}
						className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
						title="Editar">
						<Edit size={18} />
					</button>
					<button
						onClick={() => handleCampaignClick(org)}
						className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
						title="Enviar campaña">
						<Mail size={18} />
					</button>
				</div>
			</td>
		</tr>
	);
};

export default OrganizationTableRow;
