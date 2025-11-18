import React from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Save, Mail } from 'lucide-react';
import apiClient from '../../api/apiClient';

const Campaigns = ({ 
  campanasActivas = [], 
  organizaciones = [], 
  campaignTemplates = [], 
  onSelectTemplateForSend,
  // --- ¡NUEVO! Props recibidos de app.jsx ---
  setConfirmProps,
  closeConfirm,
  isLoadingTemplates, // (Opcional, para mostrar un spinner)
  onSaveTemplate,     // Función async para guardar/actualizar
  onDeleteTemplate,   // Función async para borrar
  onAddTemplate       // Función async para añadir (usa la misma que onSaveTemplate)
}) => {
  // Historial de campañas (por tipo -> fechas -> organizaciones)
  const [history, setHistory] = React.useState({ types: [], summary: { hace_dias_ultima_campana: null } });
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [historyError, setHistoryError] = React.useState(null);

  // Estado UI de acordeones (expansión exclusiva)
  const [expandedType, setExpandedType] = React.useState(null); // id del tipo expandido
  const [expandedDateByType, setExpandedDateByType] = React.useState({}); // { [typeId]: 'YYYY-MM-DD' }

  // Editor de plantillas
  const [selectedTplId, setSelectedTplId] = React.useState(campaignTemplates[0]?.id || '');
  const selectedTpl = React.useMemo(() => campaignTemplates.find(t => t.id === selectedTplId) || null, [campaignTemplates, selectedTplId]);
  const [editingTpl, setEditingTpl] = React.useState(() => selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null);

  React.useEffect(() => {
    // Sincroniza el editor cuando la plantilla seleccionada cambia (o se refresca la lista)
    setEditingTpl(selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null);
  }, [selectedTpl]);

  // Sincroniza el ID seleccionado si la lista cambia (ej: después de borrar)
  React.useEffect(() => {
    if (!selectedTplId && campaignTemplates.length > 0) {
      setSelectedTplId(campaignTemplates[0].id);
    } else if (campaignTemplates.length === 0) {
      setSelectedTplId('');
    }
  }, [campaignTemplates, selectedTplId]);

  React.useEffect(() => {
    setEditingTpl(selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null);
  }, [selectedTpl]);

  // Cargar historial desde API; si falla, usar fallback agrupando campanasActivas
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
  	 	const res = await apiClient.getCampaignsHistory();
  	 	if (!mounted) return;
  	 	setHistory(res.data);
  	  } catch (e) {
  	 	console.warn('Fallo getCampaignsHistory, se usa fallback local:', e);
  	 	setHistoryError(e?.message || 'Error al cargar historial');
  	 	if (!mounted) return;
  	 	setHistory(buildFallbackHistory(campanasActivas, campaignTemplates, organizaciones));
  	  } finally {
  	 	if (mounted) setLoadingHistory(false);
  	  }
  	};
  	load();
  	return () => { mounted = false; };
  }, [campanasActivas, campaignTemplates, organizaciones]);

  const toggleType = (typeId) => {
    setExpandedType(prev => prev === typeId ? null : typeId);
    // Al cambiar de tipo, colapsar la fecha expandida de otros
    setExpandedDateByType(prev => ({ ...prev, [typeId]: prev[typeId] || null }));
  };

  const toggleDate = (typeId, dateStr) => {
    setExpandedDateByType(prev => ({ ...prev, [typeId]: prev[typeId] === dateStr ? null : dateStr }));
  };

  // Acciones del editor de plantillas
  const handleFieldChange = (path, value) => {
    if (!editingTpl) return;
    const next = JSON.parse(JSON.stringify(editingTpl));
    // path simple: 'title' | 'description' | 'mode' | 'rawPrompt' | 'builder.instructions'...
    const segs = path.split('.');
    let obj = next;
    for (let i = 0; i < segs.length - 1; i++) {
      const k = segs[i];
      obj[k] = obj[k] || {};
      obj = obj[k];
    }
    obj[segs[segs.length - 1]] = value;
    setEditingTpl(next);
  };

  // --- LÓGICA DE ACCIÓN ORIGINAL ---
  // Estas funciones ahora llaman a las props de App.jsx (que llaman a la API)
  const saveTemplate = () => {
    if (!editingTpl) return;
    if (!editingTpl.title || !editingTpl.id) return;
    // Llama a la función del padre (App.jsx) que llama al APIClient
    onSaveTemplate?.(editingTpl); 
  };

  const deleteTemplate = () => {
    if (!editingTpl) return;
    // Llama a la función del padre (App.jsx) que llama al APIClient
    onDeleteTemplate?.(editingTpl.id);
    // Limpia la selección (App.jsx refrescará la lista)
    setSelectedTplId(''); 
    setEditingTpl(null);
  };

const addTemplate = () => { // <-- 1. Quitamos 'async'
		const baseId = "custom_" + Date.now();
		const draft = {
			id: baseId,
			title: "Nueva campaña",
			description: "Descripción breve...",
			mode: "builder",
			rawPrompt: "",
			builder: {
				campaignType: "personalizada",
				instructions: "",
				examplesGood: "",
				examplesBad: "",
				useMetadata: true,
			},
		};

		// 2. Llamamos a la API, PERO SIN 'await'.
		//    Esto guarda la plantilla en segundo plano.
		if (onAddTemplate) {
			onAddTemplate(draft);
		}

		// 3. ¡LA CLAVE! Actualizamos el estado del editor
		//    localmente y al instante.
		setEditingTpl(draft);
		setSelectedTplId(baseId);
	};

  // --- ¡NUEVO! MANEJADORES CON CONFIRMACIÓN ---
  const handleSaveClick = () => {
    if (!editingTpl) return;
    setConfirmProps({
      show: true,
      title: 'Guardar Cambios',
      message: `¿Seguro que quieres guardar los cambios en la plantilla "${editingTpl.title}"?`,
      confirmText: 'Sí, guardar',
      cancelText: 'No, volver', // Botón de cancelar
      type: 'info',
      onConfirm: () => {
        saveTemplate(); // <-- Llama a la función con logs
        closeConfirm();
      }
    });
  };

  const handleDeleteClick = () => {
    if (!editingTpl) return;
    setConfirmProps({
      show: true,
      title: 'Eliminar Plantilla',
      message: `¿Seguro que quieres eliminar la plantilla "${editingTpl.title}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar', // Botón de confirmar
      cancelText: 'No, volver',
      type: 'danger',
      onConfirm: () => {
        deleteTemplate(); // <-- Llama a la función con logs
        closeConfirm();
      }
    });
  };

  const handleUseClick = () => {
    if (!editingTpl) return;
    setConfirmProps({
      show: true,
      title: 'Seleccionar Plantilla',
      message: `¿Quieres seleccionar "${editingTpl.title}" para tu próximo envío?`,
      confirmText: 'Sí, seleccionar', // Botón de confirmar
      cancelText: 'No, volver',
      type: 'info',
      onConfirm: () => {
        onSelectTemplateForSend?.(editingTpl.id);
        closeConfirm();
      }
    });
  };
  // --- FIN DE NUEVOS MANEJADORES ---

  return (
  <div className="space-y-10">
    {/* === Sección 1: Campañas enviadas === */}
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-8 transition-all duration-300">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        📅 Campañas enviadas
      </h3>

      {/* --- Estado general --- */}
      <div className="text-sm text-slate-700 dark:text-slate-300 mb-5">
        {loadingHistory ? (
          <span className="animate-pulse">Cargando historial...</span>
        ) : history.summary?.hace_dias_ultima_campana != null ? (
          <span className="font-medium">
            Última campaña enviada:{' '}
            <span className="text-blue-600 dark:text-blue-400">
              hace {history.summary.hace_dias_ultima_campana} días
            </span>
          </span>
        ) : (
          <span>No hay información de envíos recientes.</span>
        )}
      </div>

      {historyError && (
        <p className="text-xs text-yellow-600 dark:text-yellow-300 mb-3">
          ⚠️ {historyError}. Mostrando datos locales.
        </p>
      )}

      {/* --- Listado de tipos --- */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {history.types.map((t) => (
          <div key={t.id} className="py-4">
            <button
              onClick={() => toggleType(t.id)}
              className="w-full flex items-start justify-between text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  {expandedType === t.id ? (
                    <ChevronDown size={16} className="text-blue-500" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-500" />
                  )}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {t.title}
                  </span>
                </div>
                <p className="ml-6 text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {t.description}
                </p>
              </div>

              {t.last_sent_hace_dias != null && (
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap mt-1">
                  hace {t.last_sent_hace_dias} días
                </span>
              )}
            </button>

            {/* --- Subfechas --- */}
            {expandedType === t.id && (
              <div className="mt-3 ml-6 space-y-2">
                {t.dates && t.dates.length > 0 ? (
                  t.dates.map((d) => (
                    <div
                      key={d.date}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleDate(t.id, d.date)}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedDateByType[t.id] === d.date ? (
                            <ChevronDown size={14} className="text-blue-500" />
                          ) : (
                            <ChevronRight size={14} className="text-slate-500" />
                          )}
                          <span className="text-sm text-slate-800 dark:text-slate-200">
                            {d.date}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {d.organizations?.length || 0} orgs
                        </span>
                      </button>

                      {expandedDateByType[t.id] === d.date && (
                        <div className="px-5 pb-3">
                          {(d.organizations || []).length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                              Sin organizaciones para esta fecha.
                            </p>
                          ) : (
                            <ul className="list-disc list-inside text-sm text-slate-800 dark:text-slate-200 space-y-0.5">
                              {d.organizations.map((o, idx) => (
                                <li key={o.id || idx}>
                                  {o.name || o.organizacion || o}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No hay fechas registradas para este tipo.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>

    {/* === Sección 2: Editor de campañas === */}
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          ✉️ Editor de Plantillas de Campaña
        </h3>
        <button
          onClick={addTemplate} // <-- Llama a la función con logs
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          <Plus size={16} /> Nueva plantilla
        </button>
      </div>

      {/* Cuerpo dividido */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Lista de plantillas */}
        <div className="md:col-span-1 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/20">
          <div className="p-3 space-y-1 max-h-96 overflow-y-auto scrollbar-thin">
            {/* --- ¡NUEVO! Estado de Carga --- */}
            {isLoadingTemplates && (
              <div className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center animate-pulse">
                Cargando plantillas...
              </div>
            )}
            
            {!isLoadingTemplates && campaignTemplates.length === 0 && (
               <div className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">
                 No hay plantillas.
               </div>
            )}
            {campaignTemplates.length > 0 ? (
              campaignTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTplId(tpl.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedTplId === tpl.id
                      ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 shadow-sm'
                      : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {tpl.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                      {tpl.mode === 'raw' ? 'RAW' : 'Builder'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {tpl.description}
                  </p>
                </button>
              ))
            ) : (
              !isLoadingTemplates && <div className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">No hay plantillas aún.</div>
            )} 
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
          {!editingTpl ? (
            <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-300 italic">
              {isLoadingTemplates ? 'Cargando...' : 'Selecciona o crea una plantilla para comenzar a editar.'}
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* --- Título e ID --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingTpl.title}
                    onChange={(e) =>
                      handleFieldChange('title', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ID (solo lectura)
                  </label>
                  <input
                    type="text"
                    value={editingTpl.id}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* --- Descripción --- */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={editingTpl.description}
                  onChange={(e) =>
                    handleFieldChange('description', e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* --- Selector de modo --- */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Modo
                </label>
                <select
                  value={editingTpl.mode}
                  onChange={(e) =>
                    handleFieldChange('mode', e.target.value)
                  }
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="builder">Builder</option>
                  <option value="raw">RAW (prompt completo)</option>
                </select>
              </div>

              {/* --- Campo RAW o Builder --- */}
              {editingTpl.mode === 'raw' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Prompt completo (RAW)
                  </label>
                  <textarea
                    rows={10}
                    value={editingTpl.rawPrompt || ''}
                    onChange={(e) =>
                      handleFieldChange('rawPrompt', e.target.value)
                    }
                    placeholder="Pega o escribe aquí tu prompt completo"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Si usas RAW, no se aplicará el builder visual.
                  </p>
                </div>
              ) : (
                <div className="p-5 space-y-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tipo de campaña
                      </label>
                      <input
                        type="text"
                        value={editingTpl.builder?.campaignType || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            'builder.campaignType',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        id="useMetadata"
                        type="checkbox"
                        checked={!!editingTpl.builder?.useMetadata}
                        onChange={(e) =>
                          handleFieldChange(
                            'builder.useMetadata',
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="useMetadata"
                        className="text-sm text-slate-700 dark:text-slate-300"
                      >
                        Usar metadatos (industria, intereses, etc.)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Instrucciones adicionales
                    </label>
                    <textarea
                      rows={4}
                      value={editingTpl.builder?.instructions || ''}
                      onChange={(e) =>
                        handleFieldChange(
                          'builder.instructions',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Ejemplos (Buenos)
                      </label>
                      <textarea
                        rows={4}
                        value={editingTpl.builder?.examplesGood || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            'builder.examplesGood',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Ejemplos (Malos)
                      </label>
                      <textarea
                        rows={4}
                        value={editingTpl.builder?.examplesBad || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            'builder.examplesBad',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- Botones de acción --- */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleUseClick}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/30"
                  title="Seleccionar esta plantilla para el envío"
                >
                  <Mail size={16} /> Usar en envío
                </button>

                <button
                  onClick={handleDeleteClick} // <-- Llama a la función con logs
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30"
                >
                  <Trash2 size={16} /> Eliminar
                </button>

                <button
                  onClick={handleSaveClick} // <-- Llama a la función con logs
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  <Save size={16} /> Guardar cambios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  </div>
);
}

// --- (El resto de funciones: slugify, buildFallbackHistory, normalizeDate, etc. están aquí debajo, limpias) ---

function slugify(str) {
  return (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function buildFallbackHistory(campanasActivas, campaignTemplates, organizaciones) {
  // 1) Preferente: derivar desde organizaciones[].campaigns_log (enfoque dinámico)
  const hasLogs = Array.isArray(organizaciones) && organizaciones.some(o => o && o.campaigns_log && typeof o.campaigns_log === 'object');
  if (hasLogs) {
    const typeMap = new Map(); // id -> { id, title, description, dates: Map(date -> orgs[]) }
    const allDates = [];
    organizaciones.forEach(org => {
      const log = org?.campaigns_log;
      if (!log || typeof log !== 'object') return;
      Object.entries(log).forEach(([key, info]) => {
        if (!info) return;
        const id = extractTemplateId(key);
        const tpl = campaignTemplates.find(t => t.id === id);
        const title = tpl?.title || info.template_title || id;
      	const description = tpl?.description || '';
  	 	if (!typeMap.has(id)) typeMap.set(id, { id, title, description, dates: new Map() });
  	 	const entry = typeMap.get(id);
  	 	const last = normalizeDate(info.last_sent);
  	 	if (last) {
  	 	  allDates.push(last);
  	 	  if (!entry.dates.has(last)) entry.dates.set(last, []);
  	 	  entry.dates.get(last).push({ name: org.organizacion || org.nombre || org.id || 'Org', id: org.id });
  	 	}
  	  });
  	});

  	const types = Array.from(typeMap.values()).map(t => ({
  	  id: t.id,
  	  title: t.title,
  	  description: t.description,
  	  last_sent_at: null,
  	  last_sent_hace_dias: null,
  	  dates: Array.from(t.dates.entries()).sort((a,b) => b[0].localeCompare(a[0])).map(([date, orgs]) => ({ date, organizations: orgs }))
  	}));

  	// Calcular 'hace_dias_ultima_campana' a partir de la fecha más reciente en logs
  	let hace_dias = null;
  	if (allDates.length) {
  	  const newest = allDates.sort((a,b) => b.localeCompare(a))[0];
  	  hace_dias = daysSince(newest);
  	}
  	return { types, summary: { hace_dias_ultima_campana: hace_dias } };
  }

  // 2) Alternativa: agrupar campanasActivas (si no hay campaigns_log disponible)
  const titleToId = Object.fromEntries(campaignTemplates.map(t => [t.title, t.id]));
  const map = new Map(); // id -> { id, title, description, dates: Map(date -> orgs[]) }
  (campanasActivas || []).forEach(c => {
    const id = titleToId[c.tipo] || slugify(c.tipo);
    if (!map.has(id)) {
  	  const tpl = campaignTemplates.find(t => t.id === id) || { title: c.tipo, description: '' };
  	  map.set(id, { id, title: tpl.title || c.tipo, description: tpl.description || '', dates: new Map() });
  	}
  	const entry = map.get(id);
  	const date = normalizeDate(c.fecha_envio);
  	if (!entry.dates.has(date)) entry.dates.set(date, []);
  	entry.dates.get(date).push({ name: c.organizacion, id: c.id });
  });
  const types = Array.from(map.values()).map(t => ({
  	id: t.id,
  	title: t.title,
  	description: t.description,
  	last_sent_at: null,
  	last_sent_hace_dias: null,
  	dates: Array.from(t.dates.entries()).sort((a,b) => b[0].localeCompare(a[0])).map(([date, orgs]) => ({ date, organizations: orgs }))
  }));
  // Fallback de 'hace_dias_ultima_campana' usando organizaciones.hace_dias
  let hace_dias = null;
  if (Array.isArray(organizaciones) && organizaciones.length) {
  	const values = organizaciones.map(o => o?.hace_dias).filter(v => Number.isFinite(v));
  	if (values.length) hace_dias = Math.min(...values);
  }
  return { types, summary: { hace_dias_ultima_campana: hace_dias } };
}

function normalizeDate(d) {
  // Intenta transformar formatos varios a YYYY-MM-DD
  if (!d) return '';
  // Si ya viene como YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
 // Si viene como DD-MM-YYYY
  const m = d.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return d;
}

function extractTemplateId(key) {
  // Si la clave viene con sufijo (p.ej., "mmi_analytics_123"), extraemos prefijo hasta el último "_" si coincide con algún template.
  // Estrategia: probar exacto; si no hay match, intentar recortar sufijo numérico.
  if (!key) return '';
  // Mantener clave completa como id por defecto (enfoque 100% dinámico)
  return key;
}

function daysSince(isoOrYMD) {
  try {
  	const dateStr = normalizeDate(isoOrYMD?.slice(0, 10));
  	const dt = new Date(dateStr);
  	if (Number.isNaN(dt.getTime())) return null;
  	const now = new Date();
  	const diffMs = now.getTime() - dt.getTime();
  	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch {
  	return null;
  }
}

export default Campaigns;