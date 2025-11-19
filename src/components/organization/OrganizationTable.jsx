// src/components/organization/OrganizationTable.jsx
import React from "react";
import { RefreshCw } from "lucide-react";
import { useOrganizationTableLogic } from "../../hooks/useOrganizationTableLogic"; // Importamos el Hook
import OrganizationTableRow from "./OrganizationTableRow"; // Importamos la Fila

const OrganizationTable = ({
	filteredOrgs,
	currentPage,
	ITEMS_PER_PAGE,
	selectedOrgIds,
	setSelectedOrgIds,
	selectedOrg, // Se sigue pasando para la fila
	setSelectedOrg, // Se sigue pasando para la fila
	viewDetail, // Se sigue pasando para la fila
	openEditModal, // Se sigue pasando para la fila
	handleCampaignClick, // Se sigue pasando para la fila
	ESTADOS_CLIENTE, // Se sigue pasando para la fila
	isLoading,
}) => {
	// 1. Usamos el hook para obtener la lógica y los datos paginados
	const {
		paginatedOrgs,
		areAllOnPageSelected,
		handleSelectAll,
		handleSelectOrg,
		getDisplayContacts,
	} = useOrganizationTableLogic({
		filteredOrgs,
		currentPage,
		ITEMS_PER_PAGE,
		selectedOrgIds,
		setSelectedOrgIds,
	});

	// 2. Definimos los encabezados
	const headers = [
		"Organización",
		"Contacto",
		"Estado",
		"Último contacto",
		"", // Para acciones
	];

	// 3. El JSX es ahora mucho más limpio
	return (
		<div className="mt-2 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm backdrop-blur-sm">
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
							{headers.map((header, i) => (
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
							paginatedOrgs.map((org) => (
								// 4. Delegamos el renderizado de la fila
								<OrganizationTableRow
									key={org.id}
									org={org}
									selected={selectedOrgIds.has(org.id)}
									handleSelectOrg={handleSelectOrg}
									getDisplayContacts={getDisplayContacts}
									ESTADOS_CLIENTE={ESTADOS_CLIENTE}
									setSelectedOrg={setSelectedOrg}
									viewDetail={viewDetail}
									openEditModal={openEditModal}
									handleCampaignClick={handleCampaignClick}
								/>
							))
						) : (
							// Estado vacío o de carga
							<tr>
								<td
									colSpan={headers.length + 1} // +1 por el checkbox
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
