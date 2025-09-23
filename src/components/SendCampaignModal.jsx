import React, { useState, useEffect } from 'react';

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
  setSelectedCampaignId
}) => {
  // Estado local para manejar el contenido editable
  const [editableContent, setEditableContent] = useState({
    subject: '',
    body: ''
  });

  // Cuando llega un nuevo borrador de la IA, actualizamos el estado local
  useEffect(() => {
    if (emailPreview) {
      setEditableContent(emailPreview);
    }
  }, [emailPreview]);

  if (!show || !selectedOrg) return null;

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setEditableContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderInitialView = () => (
    <>
      <h2 className="text-xl font-bold mb-4 dark:text-white">Generar campaña para {selectedOrg.nombre}</h2>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {campaignTemplates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => setSelectedCampaignId(tpl.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCampaignId === tpl.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-300 dark:border-gray-500 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold dark:text-gray-100">{tpl.title}</h4>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-200">{tpl.mode === 'raw' ? 'RAW' : 'Builder'}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{tpl.description}</p>
          </div>
        ))}
        {campaignTemplates.length === 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">No hay plantillas. Crea campañas desde la pestaña "Campañas".</div>
        )}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg dark:text-gray-200"

        >
          Cancelar
        </button>
        <button
          onClick={onGeneratePreview}
          disabled={!selectedCampaignId || isPreviewLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {isPreviewLoading ? 'Generando...' : 'Generar Borrador'}
        </button>
      </div>
    </>
  );

  const renderPreviewView = () => (
    <>
      <h2 className="text-xl font-bold mb-4 dark:text-white">Revisa y envía la campaña</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asunto</label>
          <input
            type="text"
            name="subject"
            value={editableContent.subject}
            onChange={handleContentChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuerpo del Mensaje</label>
          <textarea
            name="body"
            rows="10"
            value={editableContent.body}
            onChange={handleContentChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-100"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={isSending}
          className="px-4 py-2 border rounded-lg dark:text-gray-200 hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirmAndSend(editableContent)}
          disabled={isSending}
          className="px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-500 text-white rounded-lg disabled:opacity-50"
        >
          {isSending ? 'Enviando...' : 'Confirmar y Enviar'}
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4">
        {emailPreview ? renderPreviewView() : renderInitialView()}
      </div>
    </div>
  );
};

export default SendCampaignModal;