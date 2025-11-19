import React from 'react';

const TemplateSelectionView = ({
  selectedOrg,
  campaignTemplates,
  selectedCampaignId,
  setSelectedCampaignId,
  handleCancelClick,
  handleGenerateClick,
  isPreviewLoading,
}) => (
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
);

export default TemplateSelectionView;