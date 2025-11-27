import React from 'react';

const PreviewEditView = ({
  selectedOrg,
  editableContent,
  handleContentChange,
  onConfirmAndSend,
  isSending,
  handleCancelClick,
  onShowHtmlPreview,
  extraButtons,
}) => (
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
      {extraButtons}
      <button
        onClick={onShowHtmlPreview}
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

export default PreviewEditView;