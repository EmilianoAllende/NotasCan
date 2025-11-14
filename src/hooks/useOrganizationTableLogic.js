// src/hooks/useOrganizationTableLogic.js
import { useMemo, useCallback } from "react";

/**
 * Hook para manejar la lógica de la tabla de organizaciones
 */
export const useOrganizationTableLogic = ({
	filteredOrgs,
	currentPage,
	ITEMS_PER_PAGE,
	selectedOrgIds,
	setSelectedOrgIds,
}) => {
	// Lógica de Paginación
	const paginatedOrgs = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return filteredOrgs.slice(startIndex, endIndex);
	}, [filteredOrgs, currentPage, ITEMS_PER_PAGE]);

	// Lógica de Selección
	const paginatedOrgIds = useMemo(
		() => new Set(paginatedOrgs.map((org) => org.id)),
		[paginatedOrgs]
	);

	const areAllOnPageSelected =
		paginatedOrgs.length > 0 &&
		[...paginatedOrgIds].every((id) => selectedOrgIds.has(id));

	const handleSelectAll = useCallback(() => {
		setSelectedOrgIds((prevSelected) => {
			const newSelected = new Set(prevSelected);
			if (areAllOnPageSelected) {
				paginatedOrgIds.forEach((id) => newSelected.delete(id));
			} else {
				paginatedOrgIds.forEach((id) => newSelected.add(id));
			}
			return newSelected;
		});
	}, [areAllOnPageSelected, paginatedOrgIds, setSelectedOrgIds]);

	const handleSelectOrg = useCallback(
		(orgId) => {
			setSelectedOrgIds((prevSelected) => {
				const newSelected = new Set(prevSelected);
				newSelected.has(orgId)
					? newSelected.delete(orgId)
					: newSelected.add(orgId);
				return newSelected;
			});
		},
		[setSelectedOrgIds]
	);

	// Lógica de Parseo de Contactos
	const getDisplayContacts = useCallback((org) => {
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
	}, []);

	// Retornamos el estado y los handlers
	return {
		paginatedOrgs,
		areAllOnPageSelected,
		handleSelectAll,
		handleSelectOrg,
		getDisplayContacts,
	};
};
