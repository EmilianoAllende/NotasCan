import React, { useMemo } from "react";
import { Eye, Edit, Mail, RefreshCw } from "lucide-react";

const StatusBadge = ({ estado }) => {
	let text = "Pendiente";
	let color = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

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
const OrganizationTable = ({
	filteredOrgs,
	currentPage,
	ITEMS_PER_PAGE,
	selectedOrgIds,
	setSelectedOrgIds,
	selectedOrg,
	setSelectedOrg,
	viewDetail,
	openEditModal,
	handleCampaignClick,
	ESTADOS_CLIENTE,
	isLoading,
}) => {
	const paginatedOrgs = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return filteredOrgs.slice(startIndex, endIndex);
	}, [filteredOrgs, currentPage, ITEMS_PER_PAGE]);
	const paginatedOrgIds = useMemo(
		() => new Set(paginatedOrgs.map((org) => org.id)),
		[paginatedOrgs]
	);
	const areAllOnPageSelected =
		paginatedOrgs.length > 0 &&
		[...paginatedOrgIds].every((id) => selectedOrgIds.has(id));

	const handleSelectAll = () => {
		setSelectedOrgIds((prevSelected) => {
			const newSelected = new Set(prevSelected);
			if (areAllOnPageSelected) {
				paginatedOrgIds.forEach((id) => newSelected.delete(id));
			} else {
				paginatedOrgIds.forEach((id) => newSelected.add(id));
			}
			return newSelected;
		});
	};
	const handleSelectOrg = (orgId) => {
		setSelectedOrgIds((prevSelected) => {
			const newSelected = new Set(prevSelected);
			newSelected.has(orgId)
				? newSelected.delete(orgId)
				: newSelected.add(orgId);
			return newSelected;
		});
	};
	const getDisplayContacts = (org) => {
		let rawContacts = org.contactos || org.nombres_org;
		let contactsArray = [];

		if (rawContacts) {
			if (
				typeof rawContacts === "string" &&
				rawContacts.trim().startsWith("[")
			) {
				try {
					let clean = rawContacts.replace(/'/g, '"');
					contactsArray = JSON.parse(clean);
				} catch {
					contactsArray = [rawContacts];
				}
			} else if (typeof rawContacts === "string") {
				contactsArray = [rawContacts];
			} else if (Array.isArray(rawContacts)) {
				contactsArray = rawContacts;
			}
		}
		contactsArray = contactsArray.filter((c) => c && String(c).trim() !== "");
		if (contactsArray.length === 0)
			return { display: ["Sin contacto"], more: 0 };
		const limitedContacts = contactsArray.slice(0, 3);
		const remaining = contactsArray.length - limitedContacts.length;
		return { display: limitedContacts, more: remaining };
	};
	return (
		<div className="mt-6 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm backdrop-blur-sm">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 text-sm">
					<thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
						<tr>
							<th className="py-3 pl-4 pr-2">
								<input
									type="checkbox"
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-700"
									checked={areAllOnPageSelected}
									onChange={handleSelectAll}
									disabled={paginatedOrgs.length === 0}
								/>
							</th>
							{[
								"Organización",
								"Contacto",
								"Estado",
								"Último contacto",
								"",
							].map((header, i) => (
								<th
									key={i}
									className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
						{paginatedOrgs.length > 0 ? (
							paginatedOrgs.map((org) => {
								const { display, more } = getDisplayContacts(org);
								const selected = selectedOrgIds.has(org.id);
								return (
									<tr
										key={org.id}
										className={`transition-colors duration-150 ${
											selected
												? "bg-blue-50 dark:bg-blue-900/20"
												: "hover:bg-gray-50 dark:hover:bg-gray-800/60"
										}`}>
										<td className="py-3 pl-4 pr-2">
											<input
												type="checkbox"
												className="h-4 w-4 rounded border-gray-300 text-blue-600 dark:border-gray-500 dark:bg-gray-700"
												checked={selected}
												onChange={() => handleSelectOrg(org.id)}
											/>
										</td>
										<td className="py-3 px-3 text-gray-900 dark:text-gray-100 font-medium">
											<div className="flex items-center">
												<span
													className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${
														org.estado_cliente === ESTADOS_CLIENTE.COMPLETADO
															? "bg-green-500"
															: org.estado_cliente ===
															  ESTADOS_CLIENTE.EN_REVISION
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
										<td className="py-3 px-3 text-gray-700 dark:text-gray-300">
											{display.map((contact, i) => (
												<div key={i} className="truncate">
													{contact}
												</div>
											))}
											{more > 0 && (
												<div className="text-xs text-gray-400 italic mt-1">
													+{more} más
												</div>
											)}
										</td>
										<td className="py-3 px-3">
											<StatusBadge estado={org.estado_cliente} />
										</td>
										<td className="py-3 px-3 text-gray-600 dark:text-gray-400">
											{org.ultimo_contacto
												? new Date(org.ultimo_contacto).toLocaleDateString()
												: "Nunca"}
											{org.hace_dias != null && (
												<div className="text-xs text-gray-400">
													Hace {org.hace_dias} días
												</div>
											)}
										</td>
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
							})
						) : (
							<tr>
								<td
									colSpan="6"
									className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
									{isLoading ? (
										<div className="flex justify-center items-center">
											<RefreshCw className="animate-spin h-5 w-5 mr-2 text-blue-500" />
											Cargando organizaciones...
										</div>
									) : (
										"No se encontraron organizaciones."
									)}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};
export default OrganizationTable;
