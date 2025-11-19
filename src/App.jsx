/* eslint-disable no-unused-vars */
import React from "react";

// Importación del hook de estado centralizado
import { useAppState } from "./hooks/useAppState";

// --- ¡NUEVO! Componente para renderizar la vista principal ---
import AppContentRenderer from "./components/layout/AppContentRenderer";

// Importaciones de componentes de Layout y Modales
import SendCampaignModal from "./components/campaigns/SendCampaignModal";
import AIindicator from "./components/preview/AIindicator"; // Asumo que la ruta es esta
import Notification from "./components/common/Notification"; // Asumo que la ruta es esta
import Sidebar from "./components/common/Sidebar"; // Asumo que la ruta es esta
import ConfirmModal from "./components/common/ConfirmModal"; // Asumo que la ruta es esta
import LoginScreen from "./components/auth/LoginScreen"; // Asumo que la ruta es esta

const App = () => {
	// 1. Usar el hook de estado y obtener TODO el estado para pasarlo al renderizador
	const state = useAppState();
	
	// Desestructuración para usar las variables directamente en el JSX del Layout y Modales
	const {
		// Auth & User
		currentUser,
		isAuthenticated,
		handleLoginSuccess,
		handleLogout,
		// UI State (para el layout)
		isSidebarCollapsed,
		setIsSidebarCollapsed,
		selectedOrg,
		// Data & Loading (para el layout)
		organizaciones,
		isLoading,
		error,
		// Modals & Notifications
		showCampaignModal,
		setShowCampaignModal,
		notification,
		setNotification,
		setConfirmProps, // <-- ¡ERROR CORREGIDO! Faltaba esta función
		confirmProps,
		closeConfirm,
		// Campaigns & AI (para el SendCampaignModal y AIIndicator)
		campaignTemplates,
		selectedCampaignId,
		setSelectedCampaignId,
		handleGeneratePreview,
		handleConfirmAndSend,
		emailPreview,
		setEmailPreview, // Añadido para el onClose del modal
		isPreviewLoading,
		isSendingCampaign,
		isTaskLoading,
		isCallCenterMode,
		metricas, // para AIindicator
	} = state;

	// 2. Renderizado principal (El JSX del layout)
	return (
		<div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200">
			{!isAuthenticated && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
			{isAuthenticated && (
				<>
					<Sidebar
						activeView={state.activeView}
						setActiveView={state.setActiveView}
						selectedOrg={selectedOrg}
						onLogout={handleLogout}
						currentUser={currentUser}
						isCollapsed={isSidebarCollapsed}
						onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
					/>
					<main className="flex-1 flex flex-col overflow-y-auto">
						{isLoading && (
							<p className="text-center text-slate-500 dark:text-slate-400 p-8">
								Cargando organizaciones...
							</p>
						)}
						{error && (
							<p className="text-center text-red-500 p-8">
								Error al cargar los datos: {error?.message}
							</p>
						)}
						{!isLoading && !error && (
							<div className="h-full w-full">
								<AppContentRenderer {...state} />
							</div>
						)}
					</main>

					<SendCampaignModal
						show={showCampaignModal}
						onClose={() => {
							setShowCampaignModal(false);
							setEmailPreview(null);
						}}
						selectedOrg={selectedOrg}
						campaignTemplates={campaignTemplates}
						onGeneratePreview={handleGeneratePreview}
						onConfirmAndSend={handleConfirmAndSend}
						isPreviewLoading={isPreviewLoading}
						isSending={isSendingCampaign}
						emailPreview={emailPreview}
						selectedCampaignId={selectedCampaignId}
						setSelectedCampaignId={setSelectedCampaignId}
						isTaskLoading={isTaskLoading}
						isCallCenterMode={isCallCenterMode}
						setConfirmProps={setConfirmProps}
						closeConfirm={closeConfirm}
					/>
					<ConfirmModal
						show={confirmProps.show}
						title={confirmProps.title}
						message={confirmProps.message}
						onConfirm={confirmProps.onConfirm}
						onCancel={closeConfirm}
						confirmText={confirmProps.confirmText}
						type={confirmProps.type}
					/>
					<AIindicator metricas={metricas} procesando={organizaciones.length} />
					<Notification
						notification={notification}
						onClose={() => setNotification(null)}
					/>
				</>
			)}
		</div>
	);
};

export default App;