// src/components/organization/OrganizationTableRow.jsx
import React, { useState, useRef, useEffect } from "react";
// Agregamos MoreVertical para el ícono de los 3 puntitos
import { Eye, Edit, Mail, MoreVertical } from "lucide-react";

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

const getStatusColor = (estado) => {
	switch (estado) {
		case ESTADOS_CLIENTE.LISTA_BLANCA: return "bg-green-500";
		case ESTADOS_CLIENTE.LISTA_NEGRA: return "bg-red-500";
		case ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL: return "bg-blue-500";
		case ESTADOS_CLIENTE.OTRO_TIPO: return "bg-gray-500";
		case ESTADOS_CLIENTE.COMPETENCIA: return "bg-indigo-500";
		case ESTADOS_CLIENTE.REVISION: return "bg-orange-500";
		case ESTADOS_CLIENTE.CONTACTOS_BODY: return "bg-purple-500";
		case ESTADOS_CLIENTE.PENDIENTE: return "bg-yellow-400";
		default: return "bg-red-400";
	}
};

const formatDate = (dateString) => {
	if (!dateString || dateString === "indefinido") return null;
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return null;
	
	return new Intl.DateTimeFormat('es-ES', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(date);
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
    const email = org.id && org.id.includes('@') ? org.id : null;
	const nombreVisual = org.nombre && org.nombre !== "indefinido" ? org.nombre.replace(/"/g, '') : null;
	const sectorVisual = org.sector && org.sector !== "indefinido" ? org.sector : null;

	// --- LÓGICA DEL MENÚ DESPLEGABLE ---
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef(null);

	// Cerrar el menú si se hace clic fuera
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};
		// Solo agregamos el listener si el menú está abierto
		if (showMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showMenu]);

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
					<span
						className={`flex-shrink-0 w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white dark:ring-slate-800 ${getStatusColor(
							org.estado_cliente
						)}`}
						title={`Estado: ${org.estado_cliente}`}
					/>
					<div className="min-w-0">
						<div
							className="font-medium text-gray-900 dark:text-gray-100 whitespace-normal break-words"
							title={org.organizacion || nombreVisual}>
							{org.organizacion || nombreVisual || "Sin nombre"}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-normal break-words">
							{[
								sectorVisual, 
								(nombreVisual && nombreVisual !== org.organizacion) ? nombreVisual : null
							].filter(Boolean).join(" • ")}
						</div>
					</div>
				</div>
			</td>

			{/* Contacto + Rol */}
			<td className="py-4 px-3 align-middle text-sm">
				<div className="flex flex-col gap-0.5">
					{display.map((contact, i) => (
						<div key={i} className="font-medium text-gray-900 dark:text-gray-200 whitespace-normal break-words">
							{contact}
						</div>
					))}
                    
                    {org.rol && org.rol !== "indefinido" && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-normal break-words">
                            {org.rol.replace(/[[\]"]/g, '')}
                        </div>
                    )}

					{more > 0 && (
						<div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
							+{more} otros
						</div>
					)}
					{display.length === 0 && (
						<span className="text-gray-400 dark:text-gray-600 italic">
							Sin contacto
						</span>
					)}
				</div>
			</td>

            {/* Email */}
			<td className="py-4 px-3 align-middle">
                {email ? (
                    <a href={`mailto:${email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline block whitespace-normal break-all" title={email}>
                        {email}
                    </a>
                ) : (
                    <span className="text-xs text-gray-400 italic">No disponible</span>
                )}
			</td>

			{/* Último contacto */}
			<td className="py-4 px-3 align-middle text-gray-600 dark:text-gray-400 text-sm font-mono">
				{org.ultimo_contacto || org.hace_dias ? formatDate(org.ultimo_contacto || org.hace_dias) : "Nunca contactado"}
			</td>

			{/* --- ACCIONES CON MENÚ DESPLEGABLE --- */}
			<td className="py-4 px-3 align-middle text-right relative">
				<div className="relative inline-block text-left" ref={menuRef}>
					<button
						onClick={(e) => {
							e.stopPropagation();
							setShowMenu(!showMenu);
						}}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none"
					>
						<MoreVertical size={20} />
					</button>

					{showMenu && (
						<div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 animate-fadeIn">
							<div className="py-1" role="menu">
								<button
									onClick={(e) => {
                                        e.stopPropagation();
										setSelectedOrg(org);
										viewDetail(org);
										setShowMenu(false);
									}}
									className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
								>
									<Eye size={16} className="text-blue-500" /> Ver detalles
								</button>

								<button
									onClick={(e) => {
                                        e.stopPropagation();
										setSelectedOrg(org);
										openEditModal(org);
										setShowMenu(false);
									}}
									className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
								>
									<Edit size={16} className="text-indigo-500" /> Editar
								</button>

								<button
									onClick={(e) => {
                                        e.stopPropagation();
										handleCampaignClick(org);
										setShowMenu(false);
									}}
									className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
								>
									<Mail size={16} className="text-green-500" /> Enviar campaña
								</button>
							</div>
						</div>
					)}
				</div>
			</td>
		</tr>
	);
};

export default OrganizationTableRow;