import { X } from "lucide-react";

const HtmlPreviewModal = ({ htmlContent, onClose, selectedOrg, subject, senderEmail }) => {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-b from-slate-100/90 to-white/95 dark:from-slate-800/95 dark:to-slate-900/90 rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-scaleIn transition-all duration-300 ease-out"
      >
        {/* --- Header --- */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/70 backdrop-blur-md">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
            Vista previa del correo
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-600/40"
          >
            <X size={22} />
          </button>
        </div>

        {/* --- Información del destinatario --- */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-600 text-sm bg-white/80 dark:bg-slate-700/60 backdrop-blur-sm">
          <div className="flex flex-wrap gap-y-1 text-slate-700 dark:text-slate-300">
            <span className="font-medium w-16">De:</span>
            <span> {senderEmail}</span>
          </div>
          <div className="flex flex-wrap gap-y-1 text-slate-700 dark:text-slate-300 mt-1">
            <span className="font-medium w-16">Para:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {selectedOrg?.nombre}
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-1">
              {selectedOrg?.id}
            </span>
          </div>

          {/* --- Asunto --- */}
          <div className="flex flex-wrap gap-y-1 text-slate-700 dark:text-slate-300 mt-2">
            <span className="font-medium w-16">Asunto:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {subject || "Sin asunto"}
            </span>
          </div>
        </div>

        {/* --- Contenido --- */}
        <div className="flex-1 bg-gradient-to-b from-slate-100/80 to-slate-50/80 dark:from-slate-100/40 dark:to-slate-800/60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400/40 dark:scrollbar-thumb-slate-600/50 scrollbar-track-transparent transition-all flex justify-center items-start p-10">
          <div className="bg-white dark:bg-slate-300 w-full max-w-4xl rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <iframe
              srcDoc={htmlContent}
              title="Vista Previa del Email"
              className="w-full h-[calc(600px)] border-none bg-white dark:bg-slate-300 p-8"
              style={{
                border: "none",
                margin: 0,
                padding: 0,
                display: "block",
              }}
            />
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/60 flex justify-end backdrop-blur-md">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
          >
            Cerrar vista previa
          </button>
        </div>
      </div>
    </div>
  );
};

export default HtmlPreviewModal;
