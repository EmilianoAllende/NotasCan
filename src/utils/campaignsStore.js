// Simple localStorage-backed store for campaign templates
// Template shape:
// { id: string, title: string, description: string, mode: 'builder' | 'raw',
//   rawPrompt?: string,
//   builder?: { campaignType: string, instructions?: string, examplesGood?: string, examplesBad?: string, useMetadata?: boolean }
// }

const STORAGE_KEY = 'campaign_templates_v1';

export function getTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (e) {
    console.warn('campaignsStore: error parsing templates, resetting', e);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveTemplates(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('campaignsStore: error saving templates', e);
  }
}

export function upsertTemplate(template) {
  const list = getTemplates();
  const idx = list.findIndex(t => t.id === template.id);
  if (idx >= 0) list[idx] = template; else list.push(template);
  saveTemplates(list);
  return template;
}

export function deleteTemplate(id) {
  const list = getTemplates().filter(t => t.id !== id);
  saveTemplates(list);
}

export function seedIfEmpty(defaults) {
  const current = getTemplates();
  if (current.length === 0 && defaults && defaults.length) {
    saveTemplates(defaults);
    return defaults;
  }
  return current;
}
