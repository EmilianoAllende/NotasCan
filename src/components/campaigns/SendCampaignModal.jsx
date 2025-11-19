import React, { useState, useEffect } from "react";
// --- ¡NUEVO! Importamos el componente modularizado ---
import HtmlPreviewModal from "../preview/HtmlPreviewModal";
import TemplateSelectionView from './TemplateSelectionView';
import PreviewEditView from './PreviewEditView';
// --- ¡NUEVO! Importamos la función de utilidad ---
import { generatePreviewHtml } from "../preview/GeneratePreviewHtml";

const SendCampaignModal = ({
	show,
	onClose,
	selectedOrg,
	campaignTemplates,
	onGeneratePreview,
	onConfirmAndSend,
	isPreviewLoading,
	isSending,
	emailPreview,
	selectedCampaignId,
	setSelectedCampaignId,
	isTaskLoading,
	setConfirmProps,
	closeConfirm,
	isCallCenterMode,
}) => {
	const [showHtmlPreview, setShowHtmlPreview] = useState(false);
	const [editableContent, setEditableContent] = useState({
		subject: "",
		body: "",
	});

	useEffect(() => {
		if (emailPreview) setEditableContent(emailPreview);
		else setEditableContent({ subject: "", body: "" });
	}, [emailPreview]);

	if (!show || !selectedOrg) return null;

	if (isTaskLoading && isCallCenterMode) {
		// <-- Solo mostrar si es Call Center
		return (
			<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">				
				<div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-xl animate-scaleIn">
					<h2 className="text-xl font-bold mb-3 dark:text-white">
						Cargando tarea...
					</h2>
					<p className="text-slate-600 dark:text-slate-300">
						Por favor espera un momento.
					</p>					
				</div>
			</div>
		);
	}

	const handleCancelClick = () => {
		setConfirmProps({
			show: true,
			title: "Cancelar Acción",
			message: `¿Seguro que quieres cancelar el envío a ${selectedOrg.nombre}? Se perderá cualquier borrador no enviado.`,
			confirmText: "Sí, salir",
			cancelText: "No, volver",
			type: "danger",
			onConfirm: () => {
				onClose();
				closeConfirm();
			},
		});
	};

	const handleGenerateClick = () => {
		const templateName =
			campaignTemplates.find((t) => t.id === selectedCampaignId)?.title ||
			"la plantilla seleccionada";
		setConfirmProps({
			show: true,
			title: "Generar Borrador",
			message: `Se usará la IA para generar un borrador con la plantilla "${templateName}". ¿Continuar?`,
			confirmText: "Sí, generar",
			cancelText: "No, volver",
			type: "info",
			onConfirm: () => {
				onGeneratePreview(selectedOrg, selectedCampaignId);
				closeConfirm();
			},
		});
	};

	const handleContentChange = (e) => {
		const { name, value } = e.target;
		setEditableContent((prev) => ({ ...prev, [name]: value }));
	}; // Vistas

	const renderInitialView = () => (
  <>
    {isCallCenterMode || isPreviewLoading ? (
      <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto mt-10 backdrop-blur-sm">
        <div className="mb-6 w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Generando borrador</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Preparando tu campaña personalizada...</p>
      </div>
    ) : (
      <TemplateSelectionView
        selectedOrg={selectedOrg}
        campaignTemplates={campaignTemplates}
        selectedCampaignId={selectedCampaignId}
        setSelectedCampaignId={setSelectedCampaignId}
        handleCancelClick={handleCancelClick}
        handleGenerateClick={handleGenerateClick}
        isPreviewLoading={isPreviewLoading}
      />
    )}
  </>
	);

	const renderPreviewView = () => (
  <PreviewEditView
    selectedOrg={selectedOrg}
    editableContent={editableContent}
    handleContentChange={handleContentChange}
    onConfirmAndSend={onConfirmAndSend}
    isSending={isSending}
    handleCancelClick={handleCancelClick}
    onShowHtmlPreview={() => setShowHtmlPreview(true)}
  />
);

	return (
		<>
			<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
				<div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-[85vw] max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl animate-scaleIn">
					{emailPreview ? renderPreviewView() : renderInitialView()}
				</div>
			</div>

			{showHtmlPreview && (
				<HtmlPreviewModal
          // --- ¡CAMBIO! Llamando a la función importada ---
					htmlContent={generatePreviewHtml(editableContent, selectedOrg)}
					onClose={() => setShowHtmlPreview(false)}
          selectedOrg={selectedOrg} 
          subject={editableContent.subject} // <-- ¡PROP AÑADIDA!
				/>
			)}
		</>
	);
};

export default SendCampaignModal;
