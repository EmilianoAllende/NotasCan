import React, { useState, useEffect, useRef } from "react";
import HtmlPreviewModal from "../preview/HtmlPreviewModal";
import TemplateSelectionView from './TemplateSelectionView';
import PreviewEditView from './PreviewEditView';
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
    onSkipTask,
}) => {
    // ESTADO
    const [showHtmlPreview, setShowHtmlPreview] = useState(false);
    const [editableContent, setEditableContent] = useState({
        subject: "",
        body: "",
    });

    // REF DE BLOQUEO
    const lastRequestRef = useRef(""); 

    // LÓGICA DEL REMITENTE DINÁMICO
    const selectedCampaignObj = campaignTemplates.find(t => t.id === selectedCampaignId);
    const dynamicSenderName = selectedCampaignObj?.builder?.senderName || "MMI Analytics";
    const dynamicSenderEmail = selectedCampaignObj?.builder?.senderEmail || "ac.analytics@mmi-e.com";

    // EFECTOS

    useEffect(() => {
        if (emailPreview) setEditableContent(emailPreview);
        else if (!isPreviewLoading) setEditableContent({ subject: "", body: "" });
    }, [emailPreview, isPreviewLoading]);

    useEffect(() => {
        if (!show) {
            lastRequestRef.current = "";
            setEditableContent({ subject: "", body: "" });
        }
    }, [show]);

    useEffect(() => {
        const currentKey = `${selectedOrg?.id}-${selectedCampaignId}`;

        const shouldGenerate = 
            show && 
            !isCallCenterMode && 
            selectedOrg && 
            selectedCampaignId && 
            !emailPreview && 
            !isPreviewLoading;

        if (shouldGenerate) {
            if (lastRequestRef.current === currentKey) {
                return;
            }
            console.log("🚀 Generando borrador para:", currentKey);
            lastRequestRef.current = currentKey;
            onGeneratePreview(selectedOrg, selectedCampaignId);
        }
    }, [
        show,
        isCallCenterMode,
        selectedOrg,
        selectedCampaignId,
        emailPreview,
        isPreviewLoading,
        onGeneratePreview
    ]);

    // VALIDACIONES DE RENDERIZADO
    if (!show || !selectedOrg) return null;

    if (isTaskLoading && isCallCenterMode) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">              
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-xl animate-scaleIn">
                    <h2 className="text-xl font-bold mb-3 dark:text-white">Cargando tarea...</h2>
                    <p className="text-slate-600 dark:text-slate-300">Por favor espera un momento.</p>                    
                </div>
            </div>
        );
    }

    // MANEJADORES
    const handleCancelClick = () => {
        setConfirmProps({
            show: true,
            title: "Cancelar Acción",
            message: `¿Seguro que quieres cancelar el envío a ${selectedOrg.nombre}?`,
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
        const templateName = campaignTemplates.find((t) => t.id === selectedCampaignId)?.title || "la plantilla";
        setConfirmProps({
            show: true,
            title: "Generar Borrador",
            message: `Se usará la IA para generar un borrador con la plantilla "${templateName}". ¿Continuar?`,
            confirmText: "Sí, generar",
            cancelText: "No, volver",
            type: "info",
            onConfirm: () => {
                lastRequestRef.current = "";
                onGeneratePreview(selectedOrg, selectedCampaignId);
                closeConfirm();
            },
        });
    };

    const handleConfirmClick = (content) => {
        onConfirmAndSend({
            ...content,
            senderEmail: dynamicSenderEmail,
            senderName: dynamicSenderName
        });
    };

    const handleContentChange = (e) => {
        const { name, value } = e.target;
        setEditableContent((prev) => ({ ...prev, [name]: value }));
    };

    // VISTAS
    const renderInitialView = () => (
        <>
            {(isCallCenterMode || isPreviewLoading || (selectedCampaignId && !emailPreview)) ? (
                <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto mt-10 backdrop-blur-sm">
                    <div className="mb-6 w-16 h-16 relative">
                        <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Generando borrador</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {selectedCampaignId ? "Aplicando la plantilla seleccionada..." : "Preparando tu campaña personalizada..."}
                    </p>
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
            onConfirmAndSend={handleConfirmClick}
            isSending={isSending}
            handleCancelClick={handleCancelClick}
            onShowHtmlPreview={() => setShowHtmlPreview(true)}
            isCallCenterMode={isCallCenterMode}
            onSkipTask={onSkipTask}
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
                    htmlContent={generatePreviewHtml(
                        editableContent,
                        selectedOrg,
                        dynamicSenderName
                    )}
                    onClose={() => setShowHtmlPreview(false)}
                    selectedOrg={selectedOrg}
                    subject={editableContent.subject}
                    senderEmail={dynamicSenderEmail} 
                />
            )}
        </>
    );
};

export default SendCampaignModal;