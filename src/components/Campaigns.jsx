import React from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Save, Mail } from 'lucide-react';
import apiClient from '../api/apiClient';

// Esperamos que el backend provea, por organización, los siguientes campos:
// - hace_dias_ultima_campana: number
// - last_campaign_mmi_analytics: ISODate string (última fecha enviada para MMI Analytics)
// - last_campaign_roi: ISODate string
// - last_campaign_fundacion: ISODate string
// Además, un endpoint de historial agregado: GET /webhook/campaigns-history
// Estructura sugerida de respuesta:
// {
//   types: [
//     { id: 'mmi_analytics', title: 'MMI Analytics', description: '...',
//       last_sent_at: '2025-08-05', last_sent_hace_dias: 12,
//       dates: [ { date: '2025-08-05', organizations: [{ id:'orgId', name:'Org Name'}] } ]
//     }, ...
//   ],
//   summary: { hace_dias_ultima_campana: 12 }
// }

const Campaigns = ({ campanasActivas = [], organizaciones = [], campaignTemplates = [], onTemplatesChange, onSelectTemplateForSend }) => {
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

  const saveTemplate = () => {
    if (!editingTpl) return;
    if (!editingTpl.title || !editingTpl.id) return;
    const next = campaignTemplates.map(t => t.id === editingTpl.id ? editingTpl : t);
    onTemplatesChange?.(next);
  };

  const deleteTemplate = () => {
    if (!editingTpl) return;
    const next = campaignTemplates.filter(t => t.id !== editingTpl.id);
    onTemplatesChange?.(next);
    setSelectedTplId(next[0]?.id || '');
  };

  const addTemplate = () => {
    const baseId = 'custom_' + Date.now();
    const draft = {
      id: baseId,
      title: 'Nueva campaña',
      description: 'Descripción breve...',
      mode: 'builder',
      rawPrompt: '',
      builder: { campaignType: 'personalizada', instructions: '', examplesGood: '', examplesBad: '', useMetadata: true }
    };
    const next = [...campaignTemplates, draft];
    onTemplatesChange?.(next);
    setSelectedTplId(baseId);
  };

  return (
    <div className="space-y-6">
      {/* Sección 1: Campañas enviadas */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-300 mb-4">Campañas enviadas</h3>

        {/* Resumen: último envío (hace_dias) */}
        <div className="mb-4 text-sm text-gray-700 dark:text-gray-200">
          {loadingHistory ? (
            <span>Cargando historial...</span>
          ) : history.summary?.hace_dias_ultima_campana != null ? (
            <span>Última campaña enviada: hace {history.summary.hace_dias_ultima_campana} días</span>
          ) : (
            <span>No hay información de envíos recientes.</span>
          )}
        </div>

        {historyError && (
          <div className="mb-3 text-xs text-yellow-700 dark:text-yellow-300">{historyError}. Mostrando datos locales.</div>
        )}

        {/* Acordeón por tipo */}
        <div className="divide-y divide-gray-300 dark:divide-gray-600">
          {history.types.map((t) => (
            <div key={t.id} className="py-3">
              <button
                className="w-full flex items-start justify-between gap-3 text-left"
                onClick={() => toggleType(t.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {expandedType === t.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{t.title}</span>
                  </div>
                  <p className="ml-6 text-sm text-gray-700 dark:text-gray-300">{t.description}</p>
                </div>
                {t.last_sent_hace_dias != null && (
                  <span className="text-xs text-gray-600 dark:text-gray-300">Última: hace {t.last_sent_hace_dias} días</span>
                )}
              </button>

              {expandedType === t.id && (
                <div className="mt-2 ml-6">
                  {t.dates && t.dates.length > 0 ? (
                    <div className="space-y-2">
                      {t.dates.map(d => (
                        <div key={d.date} className="border border-gray-200 dark:border-gray-600 rounded">
                          <button
                            className="w-full flex items-center justify-between px-3 py-2"
                            onClick={() => toggleDate(t.id, d.date)}
                          >
                            <div className="flex items-center gap-2">
                              {expandedDateByType[t.id] === d.date ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <span className="text-sm text-gray-800 dark:text-gray-200">{d.date}</span>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{d.organizations?.length || 0} orgs</span>
                          </button>
                          {expandedDateByType[t.id] === d.date && (
                            <div className="px-4 pb-3">
                              {(d.organizations || []).length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-300">Sin organizaciones para esta fecha.</p>
                              ) : (
                                <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-200">
                                  {d.organizations.map((o, idx) => (
                                    <li key={o.id || idx}>{o.name || o.organizacion || o}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">No hay fechas registradas para este tipo.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sección 2: Editor de campañas */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-300">Editor de campañas</h3>
          <button onClick={addTemplate} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-500">
            <Plus size={16} /> Nueva campaña
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Lista de plantillas */}
          <div className="md:col-span-4">
            <div className="border rounded overflow-hidden dark:border-gray-600">
              <div className="max-h-80 overflow-y-auto">
                {campaignTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    className={`w-full text-left px-3 py-2 border-b dark:border-gray-600 ${selectedTplId === tpl.id ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    onClick={() => setSelectedTplId(tpl.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium dark:text-gray-100">{tpl.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-200">{tpl.mode === 'raw' ? 'RAW' : 'Builder'}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{tpl.description}</p>
                  </button>
                ))}
                {campaignTemplates.length === 0 && (
                  <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No hay plantillas aún.</div>
                )}
              </div>
            </div>
          </div>

          {/* Formulario de edición */}
          <div className="md:col-span-8">
            {!editingTpl ? (
              <div className="p-4 text-sm text-gray-700 dark:text-gray-200">Selecciona o crea una plantilla para editar.</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                    <input
                      type="text"
                      value={editingTpl.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ID (solo lectura)</label>
                    <input
                      type="text"
                      value={editingTpl.id}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                  <textarea
                    rows="2"
                    value={editingTpl.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo</label>
                  <select
                    value={editingTpl.mode}
                    onChange={(e) => handleFieldChange('mode', e.target.value)}
                    className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="builder">Builder</option>
                    <option value="raw">RAW (prompt completo)</option>
                  </select>
                </div>

                {editingTpl.mode === 'raw' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt completo (RAW)</label>
                    <textarea
                      rows="10"
                      value={editingTpl.rawPrompt || ''}
                      onChange={(e) => handleFieldChange('rawPrompt', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
                      placeholder="Pega o escribe aquí tu prompt completo"
                    />
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Si usas RAW, no se aplicará el builder.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de campaña</label>
                        <input
                          type="text"
                          value={editingTpl.builder?.campaignType || ''}
                          onChange={(e) => handleFieldChange('builder.campaignType', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-6">
                        <input
                          id="useMetadata"
                          type="checkbox"
                          checked={!!editingTpl.builder?.useMetadata}
                          onChange={(e) => handleFieldChange('builder.useMetadata', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <label htmlFor="useMetadata" className="text-sm text-gray-700 dark:text-gray-300">Usar metadatos (industria, intereses, etc.)</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instrucciones adicionales</label>
                      <textarea
                        rows="4"
                        value={editingTpl.builder?.instructions || ''}
                        onChange={(e) => handleFieldChange('builder.instructions', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ejemplos (Buenos)</label>
                        <textarea
                          rows="4"
                          value={editingTpl.builder?.examplesGood || ''}
                          onChange={(e) => handleFieldChange('builder.examplesGood', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ejemplos (Malos)</label>
                        <textarea
                          rows="4"
                          value={editingTpl.builder?.examplesBad || ''}
                          onChange={(e) => handleFieldChange('builder.examplesBad', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 justify-end pt-2">
                  <button
                    onClick={() => editingTpl && onSelectTemplateForSend?.(editingTpl.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded border border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                    title="Seleccionar esta plantilla para el envío"
                  >
                    <Mail size={16} /> Usar en envío
                  </button>
                  <button onClick={deleteTemplate} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900">
                    <Trash2 size={16} /> Eliminar
                  </button>
                  <button onClick={saveTemplate} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-500">
                    <Save size={16} /> Guardar cambios
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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