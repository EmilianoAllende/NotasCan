import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// === MODAL DE VISTA PREVIA ===
const HtmlPreviewModal = ({ htmlContent, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-scaleIn"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Vista previa del correo
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 overflow-y-auto">
          <iframe
            srcDoc={htmlContent}
            title="Vista Previa del Email"
            className="w-full h-full bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

// === MODAL PRINCIPAL ===
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
}) => {
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [editableContent, setEditableContent] = useState({ subject: '', body: '' });

  useEffect(() => {
    if (emailPreview) setEditableContent(emailPreview);
    else setEditableContent({ subject: '', body: '' });
  }, [emailPreview]);

  if (!show || !selectedOrg) return null;

  if (isTaskLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-xl animate-scaleIn">
          <h2 className="text-xl font-bold mb-3 dark:text-white">Cargando tarea...</h2>
          <p className="text-slate-600 dark:text-slate-300">Por favor espera un momento.</p>
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
        onGeneratePreview();
        closeConfirm();
      },
    });
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setEditableContent((prev) => ({ ...prev, [name]: value }));
  };

  // === HTML para la vista previa ===
  const generatePreviewHtml = () => {
    const bodyHtml = editableContent.body
      .split('\n')
      .map((line) => `<p>${line || '&nbsp;'}</p>`)
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${editableContent.subject}</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f1f3f5; font-family: 'Segoe UI', sans-serif; color: #333; }
          .email-container { max-width: 640px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6; }
          .header { background: #e9ecef; padding: 18px; text-align: center; font-size: 18px; font-weight: 600; color: #2c3e50; }
          .content { padding: 28px; line-height: 1.6; }
          .content p { margin: 0 0 12px; color: #444; }
          .button-container { text-align: center; padding: 30px 0; }
          .button { background: #345995; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 500; }
          .footer { background: #f8f9fa; font-size: 13px; color: #6c757d; padding: 20px; text-align: center; border-top: 1px solid #dee2e6; }
          .footer a { color: #6c757d; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">Comunicado Institucional</div>
          <div class="content">
            <p><strong>Asunto:</strong> ${editableContent.subject}</p>
            ${bodyHtml}
          </div>
          <div class="button-container">
            <a href="https://mmi-e.com/contacto/" class="button" target="_blank">Explorar posibles sinergias</a>
          </div>
          <div class="footer">
            MMI Analytics © 2024.<br/>
            Este correo fue enviado a ${selectedOrg.id || 'destinatario@example.com'}.<br/>
            <a href="#">Darse de baja</a>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const renderInitialView = () => (
    <>
      <h2 className="text-3xl font-semibold mb-6 text-slate-900 dark:text-white">
        Generar campaña para{' '}
        <span className="text-blue-600 dark:text-blue-400">{selectedOrg.nombre}</span>
      </h2>

      <div className="grid sm:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-700">
        {campaignTemplates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => setSelectedCampaignId(tpl.id)}
            className={`group p-5 rounded-xl border shadow-sm transition-all cursor-pointer hover:shadow-md ${
              selectedCampaignId === tpl.id
                ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 ring-2 ring-blue-500/50'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
                {tpl.title}
              </h4>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-md uppercase ${
                  tpl.mode === 'raw'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-100'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100'
                }`}
              >
                {tpl.mode === 'raw' ? 'RAW' : 'Builder'}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">{tpl.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={handleCancelClick}
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
        <button
          onClick={handleGenerateClick}
          disabled={!selectedCampaignId || isPreviewLoading}
          className={`px-5 py-2 rounded-lg font-medium shadow-sm ${
            !selectedCampaignId || isPreviewLoading
              ? 'bg-blue-400 cursor-not-allowed opacity-70 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isPreviewLoading ? 'Generando...' : 'Generar Borrador'}
        </button>
      </div>
    </>
  );

  const renderPreviewView = () => (
    <>
      <h2 className="text-2xl font-semibold mb-5 text-slate-900 dark:text-white">
        Revisa y envía la campaña
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Asunto
          </label>
          <input
            type="text"
            name="subject"
            value={editableContent.subject}
            onChange={handleContentChange}
            autoComplete="off"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Cuerpo del mensaje
          </label>
          <textarea
            name="body"
            rows="10"
            value={editableContent.body}
            onChange={handleContentChange}
            autoComplete="off"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setShowHtmlPreview(true)}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Previsualizar
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleCancelClick}
            disabled={isSending}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmAndSend(editableContent)}
            disabled={isSending}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-60"
          >
            {isSending ? 'Enviando...' : 'Confirmar y Enviar'}
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
          htmlContent={generatePreviewHtml()}
          onClose={() => setShowHtmlPreview(false)}
        />
      )}
    </>
  );
};

export default SendCampaignModal;
