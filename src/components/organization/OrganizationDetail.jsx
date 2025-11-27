import React from "react";

import DetailHeader from "./DetailHeader";
import ContactInfo from "./ContactInfo";
import ActivityAndTopics from "./ActivityAndTopics";
import DetailActions from "./DetailActions";

const StatusBadge = ({ estado }) => {
	let text = "";
	let color = "";

	if (estado === 1) {
		text = "Lista Blanca";
		color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
	} else if (estado === 2) {
		text = "Lista negra ";
		color = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
	} else if (estado === 3) {
		text = "Lista Blanca Nacional ";
		color =
			"bg-yellow-100 text-red-800 dark:bg-yellow-900 dark:text-yellow-300";
	}

	return (
		<span
			className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
			{text}
		</span>
	);
};

const OrganizationDetail = ({
	selectedOrg,
	openEditModal,
	setShowCampaignModal,
	selectedCampaignId,
	onSelectCampaignRequired,
}) => {
	if (!selectedOrg) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="p-8 text-center text-gray-500 dark:text-gray-400">
					<p>Selecciona una organización de la lista para ver sus detalles.</p>
				</div>
			</div>
		);
	}
	let metadata = {};
	try {
		if (
			typeof selectedOrg.metadata === "string" &&
			selectedOrg.metadata !== "indefinido"
		) {
			metadata = JSON.parse(selectedOrg.metadata);
		}
	} catch (e) {
		console.error("Error al parsear metadata:", e);
	}

	const orgInfo = metadata.organizacion || {};

return (
    <div className="space-y-6 max-h-auto overflow-y-auto pr-2 p-4">
        <DetailHeader
            selectedOrg={selectedOrg}
            orgInfo={orgInfo}
            StatusBadge={StatusBadge}
        />
        
        <ContactInfo selectedOrg={selectedOrg} orgInfo={orgInfo} />

        <ActivityAndTopics selectedOrg={selectedOrg} orgInfo={orgInfo} />

        <DetailActions
            selectedOrg={selectedOrg}
            openEditModal={openEditModal}
            setShowCampaignModal={setShowCampaignModal}
            selectedCampaignId={selectedCampaignId}
            onSelectCampaignRequired={onSelectCampaignRequired}
        />
    </div>
);
};

export default OrganizationDetail;
