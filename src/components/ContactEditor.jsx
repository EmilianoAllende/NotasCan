import React, { useState, useEffect } from 'react';
import InformacionBasicaTab from './editor-tabs/InformacionBasicaTab';
import ContactosTab from './editor-tabs/ContactosTab';
import EstadoComercialTab from './editor-tabs/EstadoComercialTab';

// Función auxiliar: detecta cambios entre el original y el modificado
const getChangedFields = (originalData, currentData) => {
  const changes = {};
  Object.keys(currentData).forEach((key) => {
    if (originalData.hasOwnProperty(key) && originalData[key] !== currentData[key]) {
      changes[key] = currentData[key];
    }
  });
  return changes;
};

const ContactEditor = ({
  selectedOrg,
  onSave,
  onCancel,
  isSaving,
  setConfirmProps,
  closeConfirm,
}) => {
  const [activeTab, setActiveTab] = useState('basica');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (selectedOrg) {
      setFormData({ ...selectedOrg });
    }
  }, [selectedOrg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const changedData = getChangedFields(selectedOrg, formData);
    if (Object.keys(changedData).length === 0) {
      onCancel();
      return;
    }

    setConfirmProps({
      show: true,
      title: 'Confirmar Guardado',
      message: `¿Deseas guardar ${Object.keys(changedData).length} cambio(s) en "${selectedOrg.nombre}"?`,
      confirmText: 'Sí, guardar',
      cancelText: 'No, volver',
      type: 'info',
      onConfirm: () => {
        const payload = { id: selectedOrg.id, ...changedData };
        onSave(payload);
        closeConfirm();
      },
    });
  };

  const handleCancelClick = () => {
    const changedData = getChangedFields(selectedOrg, formData);
    if (Object.keys(changedData).length === 0) {
      onCancel();
      return;
    }

    setConfirmProps({
      show: true,
      title: 'Descartar Cambios',
      message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
      confirmText: 'Sí, descartar',
      cancelText: 'No, volver',
      type: 'danger',
      onConfirm: () => {
        onCancel();
        closeConfirm();
      },
    });
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-slate-500 dark:text-slate-400 p-8">
          Selecciona una organización para editar su información.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* --- Encabezado --- */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Editor Avanzado</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {formData.organizacion || formData.id}
          </p>
        </div>
      </div>

      {/* --- Tabs --- */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40">
        {[
          { key: 'basica', label: 'Información básica' },
          { key: 'contactos', label: 'Contactos' },
          { key: 'comercial', label: 'Estado comercial' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- Contenido --- */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'basica' && (
          <InformacionBasicaTab data={formData} handleChange={handleChange} />
        )}
        {activeTab === 'contactos' && (
          <ContactosTab data={formData} handleChange={handleChange} />
        )}
        {activeTab === 'comercial' && (
          <EstadoComercialTab data={formData} handleChange={handleChange} />
        )}
      </div>

      {/* --- Botones inferiores --- */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
        <button
          onClick={handleCancelClick}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-400/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default ContactEditor;
