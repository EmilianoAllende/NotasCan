// src/components/organization/DetailActions.jsx

import React from "react";
import { Mail, Edit } from "lucide-react";

const DetailActions = ({
	selectedOrg,
	openEditModal,
	setShowCampaignModal,
	selectedCampaignId,
	onSelectCampaignRequired,
}) => (
	<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
		<h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
			Acciones disponibles
		</h3>
		<div className="flex flex-wrap gap-3">
			<button
				onClick={() => openEditModal(selectedOrg)}
				className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
				<Edit size={16} />
				Editar Contacto
			</button>

			<button
				onClick={() => {
					if (selectedCampaignId) {
						setShowCampaignModal(true);
					} else {
						onSelectCampaignRequired(); // Muestra notificación de error
					}
				}}
				className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
				<Mail size={16} />
				Enviar email
			</button>
		</div>
	</div>
);

export default DetailActions;
