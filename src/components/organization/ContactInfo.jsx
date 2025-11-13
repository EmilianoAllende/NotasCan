// src/components/organization/ContactInfo.jsx

import React from "react";

const ContactInfo = ({ selectedOrg, orgInfo }) => {
	const hasContactInfo =
		selectedOrg.nombres_org ||
		selectedOrg.nombre_contacto ||
		orgInfo.contacto_principal ||
		selectedOrg.telefono ||
		selectedOrg.direccion;

	if (!hasContactInfo) {
		return null;
	}

	return (
		<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
			<h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
				Información de contacto
			</h3>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{selectedOrg.nombres_org &&
					selectedOrg.nombres_org !== "indefinido" && (
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Contacto Principal (Campañas)
							</p>
							<p className="font-medium text-blue-600 dark:text-blue-400">
								{selectedOrg.nombres_org}
							</p>
						</div>
					)}
				{selectedOrg.nombre_contacto &&
					selectedOrg.nombre_contacto !== "indefinido" && (
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Contacto general
							</p>
							<p className="font-medium dark:text-gray-200">
								{selectedOrg.nombre_contacto}
							</p>
						</div>
					)}
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Cargo</p>
					<p className="font-medium dark:text-gray-200">
						{selectedOrg.rol || orgInfo.contacto_principal?.cargo || "[vacio]"}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
					<p className="font-medium text-blue-600 dark:text-blue-400">
						{selectedOrg.telefono ||
							orgInfo.contacto_principal?.telefono ||
							"[vacio]"}
					</p>
				</div>
				{selectedOrg.direccion && selectedOrg.direccion !== "indefinido" && (
					<div className="col-span-2">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Dirección
						</p>
						<p className="font-medium dark:text-gray-200">
							{selectedOrg.direccion}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ContactInfo;
