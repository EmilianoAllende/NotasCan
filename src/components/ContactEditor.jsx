import React, { useState, useEffect } from 'react';
import InformacionBasicaTab from './editor-tabs/InformacionBasicaTab';
import ContactosTab from './editor-tabs/ContactosTab'
import EstadoComercialTab from './editor-tabs/EstadoComercialTab';

const ContactEditor = ({ selectedOrg, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('basica');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (selectedOrg) {
      setFormData({ ...selectedOrg });
    }
  }, [selectedOrg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!formData) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Selecciona una organización de la lista para ver sus detalles o editarla.</p>
            </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Editor Avanzado</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{formData.organizacion || formData.id}</p>
        </div>
      </div>

      <div className="flex border-b bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
        <button onClick={() => setActiveTab('basica')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'basica' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
          Información básica
        </button>
        <button onClick={() => setActiveTab('contactos')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'contactos' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
          Contactos
        </button>
        <button onClick={() => setActiveTab('comercial')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'comercial' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
          Estado comercial
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'basica' && <InformacionBasicaTab data={formData} handleChange={handleChange} />}
        {activeTab === 'contactos' && <ContactosTab data={formData} handleChange={handleChange} />}
        {activeTab === 'comercial' && <EstadoComercialTab data={formData} handleChange={handleChange} />}
      </div>

      <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
          Cancelar
        </button>
        <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default ContactEditor;