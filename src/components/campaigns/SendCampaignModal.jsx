import React, { useState, useEffect } from 'react';
// --- ¡NUEVO! Importamos el componente modularizado ---
import HtmlPreviewModal from '../preview/HtmlPreviewModal'; 
// --- ¡NUEVO! Importamos la función de utilidad ---
import { generatePreviewHtml } from '../preview/GeneratePreviewHtml';

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
  onExecuteCallCenterStart 
}) => {
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [editableContent, setEditableContent] = useState({ subject: '', body: '' });

  useEffect(() => {
    if (emailPreview) setEditableContent(emailPreview);
    else setEditableContent({ subject: '', body: '' });
  }, [emailPreview]);


  if (!show || !selectedOrg) return null;

  if (isTaskLoading && isCallCenterMode) { // <-- Solo mostrar si es Call Center
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-xl animate-scaleIn">
  	 	  <h2 className="text-xl font-bold mb-3 dark:text-white">Cargando tarea...</h2>
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
  	  title: 'Cancelar Acción',
  	  message: `¿Seguro que quieres cancelar el envío a ${selectedOrg.nombre}? Se perderá cualquier borrador no enviado.`,
  	  confirmText: 'Sí, salir',
  	  cancelText: 'No, volver',
  	  type: 'danger',
  	  onConfirm: () => {
  		onClose();
  		closeConfirm();
  	  },
  	});
  };

  const handleGenerateClick = () => {
    const templateName =
  	  campaignTemplates.find((t) => t.id === selectedCampaignId)?.title || 'la plantilla seleccionada';
    setConfirmProps({
  	  show: true,
  	  title: 'Generar Borrador',
  	  message: `Se usará la IA para generar un borrador con la plantilla "${templateName}". ¿Continuar?`,
  	  confirmText: 'Sí, generar',
  	  cancelText: 'No, volver',
  	  type: 'info',
  	  onConfirm: () => {
  	 	onGeneratePreview(selectedOrg, selectedCampaignId);
  	 	closeConfirm();
  	  },
  	});
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setEditableContent((prev) => ({ ...prev, [name]: value }));
  };


  // Vistas
const renderInitialView = () => (
  <>
    {(isCallCenterMode || isPreviewLoading) && (
      <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto mt-10 backdrop-blur-sm">
        <div className="mb-6 w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
          Generando borrador
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Preparando tu campaña personalizada...
        </p>
      </div>
    )}

    {!isCallCenterMode && !isPreviewLoading && (
      <div className="animate-in fade-in duration-500">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white">
            Selecciona una plantilla
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            para{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400 relative inline-block">
              {selectedOrg.nombre}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></span>
            </span>
          </p>
        </div>

        {/* Plantillas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[65vh] overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500">
          {campaignTemplates.map((tpl, index) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedCampaignId(tpl.id)}
              style={{ animationDelay: `${index * 60}ms` }}
              className={`group p-6 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 ${
                selectedCampaignId === tpl.id
                  ? "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-800/30 border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/50 dark:ring-blue-500/50 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 scale-[1.03]"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-slate-900/30 hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tpl.title}
                </h4>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-transform group-hover:scale-110 ${
                    tpl.mode === "raw"
                      ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 dark:from-purple-700 dark:to-purple-600 dark:text-purple-100"
                      : "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 dark:from-emerald-700 dark:to-emerald-600 dark:text-emerald-100"
                  }`}
                >
                  {tpl.mode === "raw" ? "RAW" : "Builder"}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {tpl.description}
              </p>

              <div
                className={`mt-4 pt-4 border-t transition-all ${
                  selectedCampaignId === tpl.id
                    ? "border-blue-200 dark:border-blue-700"
                    : "border-slate-100 dark:border-slate-700"
                }`}
              >
                <span
                  className={`text-xs font-medium transition-colors ${
                    selectedCampaignId === tpl.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
                  }`}
                >
                  {selectedCampaignId === tpl.id
                    ? "✓ Seleccionada"
                    : "Clic para seleccionar"}
                </span>
              </div>
            </div>
          ))}

          {campaignTemplates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-base">
                No hay plantillas disponibles en este momento.
              </p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleCancelClick}
            className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerateClick}
            disabled={!selectedCampaignId || isPreviewLoading}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2 ${
              !selectedCampaignId || isPreviewLoading
                ? "bg-slate-400 cursor-not-allowed opacity-60 text-white"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl"
            }`}
          >
            {isPreviewLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando...
              </>
            ) : (
              <>
                Generar Borrador
                <span className="text-lg">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    )}
  </>
);


 const renderPreviewView = () => (
  <>
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">
        Revisa y envía la campaña
      </h2>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-600 dark:text-slate-400">Enviando a:</span>
        <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedOrg.nombre}</span>
        <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
          {selectedOrg.id}
        </span>
      </div>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Asunto
        </label>
        <input
          type="text"
          name="subject"
          value={editableContent.subject}
          onChange={handleContentChange}
          autoComplete="off"
          className="block w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Cuerpo del mensaje
        </label>
        <textarea
          name="body"
          rows="10"
          value={editableContent.body}
          onChange={handleContentChange}
          autoComplete="off"
          className="block w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
        />
      </div>
    </div>

    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setShowHtmlPreview(true)}
        className="px-5 py-2.5 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 active:scale-95"
      >
        👁️ Previsualizar
      </button>

      <div className="flex gap-3">
        <button
          onClick={handleCancelClick}
          disabled={isSending}
          className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirmAndSend(editableContent)}
          disabled={isSending}
          className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-200 dark:shadow-green-900/30 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            <>
              Confirmar y Enviar
              <span className="text-lg">✓</span>
            </>
          )}
        </button>
      </div>
    </div>
  </>
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