import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// -------------------------
// Modal de Vista Previa (Simulación Gmail)
// -------------------------
const HtmlPreviewModal = ({ htmlContent, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera estilo Gmail */}
        <div className="flex items-center justify-between bg-[#D93025] text-white px-5 py-3">
          <div className="flex items-center gap-3">
            <img
              src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r2.png"
              alt="Gmail"
              className="h-6"
            />
            <span className="text-sm opacity-90">Vista previa de correo</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 bg-[#f6f8fc] overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white shadow-sm my-8 rounded-md overflow-hidden border border-slate-200">
            <iframe
              srcDoc={htmlContent}
              title="Vista Previa de Email"
              className="w-full h-[80vh]"
              style={{ border: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// Modal Principal (Envío de Campañas)
// -------------------------
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
  const [editableContent, setEditableContent] = useState({ subject: "", body: "" });

  useEffect(() => {
    if (emailPreview) setEditableContent(emailPreview);
    else setEditableContent({ subject: "", body: "" });
  }, [emailPreview]);

  if (!show || !selectedOrg) return null;

  // Cargando tareas
  if (isTaskLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-lg">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">
            Cargando siguiente tarea...
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Por favor, espera unos segundos.
          </p>
        </div>
      </div>
    );
  }

  // Handlers
  const handleCancelClick = () => {
    setConfirmProps({
      show: true,
      title: "Cancelar acción",
      message: `¿Seguro que deseas cancelar el envío a ${selectedOrg.nombre}?`,
      confirmText: "Sí, cancelar",
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
      title: "Generar borrador",
      message: `¿Deseas usar la IA para crear un borrador con la plantilla "${templateName}"?`,
      confirmText: "Sí, generar",
      cancelText: "No, volver",
      type: "info",
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

  // HTML simulando un correo real de Gmail
  const generatePreviewHtml = () => {
    const bodyHtml = editableContent.body
      .split("\n")
      .map((line) => `<p>${line || "&nbsp;"}</p>`)
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>${editableContent.subject}</title>
        <style>
          body { margin:0; background:#f6f8fc; font-family:'Roboto', Arial, sans-serif; color:#202124; }
          .gmail-container { max-width:600px; margin:40px auto; background:#fff; border:1px solid #dadce0; border-radius:8px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.1); }
          .header { padding:16px 20px; border-bottom:1px solid #e0e0e0; }
          .header strong { font-size:14px; color:#1a73e8; }
          .subject { font-size:18px; font-weight:500; margin:12px 0; color:#202124; }
          .content { padding:24px 20px; font-size:15px; line-height:1.6; }
          .content p { margin:0 0 14px; }
          .cta { text-align:center; padding:20px; }
          .cta a { background:#1a73e8; color:#fff; padding:10px 22px; text-decoration:none; border-radius:4px; font-weight:500; }
          .footer { font-size:12px; color:#5f6368; text-align:center; padding:16px; border-top:1px solid #e0e0e0; background:#f8f9fa; }
        </style>
      </head>
      <body>
        <div class="gmail-container">
          <div class="header">
            <div><strong>MMI Analytics</strong> &lt;contacto@mmi-e.com&gt;</div>
            <div class="subject">${editableContent.subject}</div>
          </div>
          <div class="content">${bodyHtml}</div>
          <div class="cta"><a href="https://mmi-e.com/contacto/" target="_blank">Explorar posibles sinergias</a></div>
          <div class="footer">
            © 2025 MMI Analytics — Todos los derechos reservados.<br>
            Si no deseas recibir más correos, <a href="#" style="color:#1a73e8;">darte de baja aquí</a>.
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Vistas
  const renderInitialView = () => (
    <>
      <h2 className="text-2xl font-semibold mb-5 text-center text-slate-900 dark:text-white">
        Selecciona una plantilla para{" "}
        <span className="text-blue-600 dark:text-blue-400">
          {selectedOrg.nombre}
        </span>
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 pl-1 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {campaignTemplates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => setSelectedCampaignId(tpl.id)}
            className={`p-4 rounded-lg cursor-pointer transition-all border ${
              selectedCampaignId === tpl.id
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/50 shadow-md"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                {tpl.title}
              </h4>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  tpl.mode === "raw"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-100"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100"
                }`}
              >
                {tpl.mode === "raw" ? "RAW" : "Builder"}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {tpl.description}
            </p>
          </div>
        ))}

        {campaignTemplates.length === 0 && (
          <p className="col-span-2 text-sm text-slate-500 italic text-center">
            No hay plantillas disponibles.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleCancelClick}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
        <button
          onClick={handleGenerateClick}
          disabled={!selectedCampaignId || isPreviewLoading}
          className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
            !selectedCampaignId || isPreviewLoading
              ? "bg-blue-400 cursor-not-allowed opacity-70 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isPreviewLoading ? "Generando..." : "Generar Borrador"}
        </button>
      </div>
    </>
  );

  const renderPreviewView = () => (
  <>
    <h2 className="text-xl font-semibold mb-5 text-center text-slate-900 dark:text-white">
      Revisa y envía tu campaña
    </h2>

    {/* Contenedor más ancho pero centrado */}
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Campo Asunto */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Asunto
        </label>
        <input
          type="text"
          name="subject"
          value={editableContent.subject}
          onChange={handleContentChange}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Campo Cuerpo del mensaje */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Cuerpo del mensaje
        </label>
        <textarea
          name="body"
          rows="20"
          value={editableContent.body}
          onChange={handleContentChange}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    {/* Botones alineados al mismo ancho */}
    <div className="flex justify-between items-center mt-6 max-w-4xl mx-auto">
      <button
        onClick={() => setShowHtmlPreview(true)}
        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        Previsualizar
      </button>

      <div className="flex gap-3">
        <button
          onClick={handleCancelClick}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirmAndSend(editableContent)}
          disabled={isSending}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {isSending ? "Enviando..." : "Confirmar y Enviar"}
        </button>
      </div>
    </div>
  </>
);


  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-4xl w-full max-h-[85vh] mx-6 overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 transition-all scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
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
