import React from 'react';

const SendCampaignModal = ({
  show,
  onClose,
  selectedOrg,
  tiposCampana,
  selectedCampaignType,
  setSelectedCampaignType,
  onSend,
  isSending
}) => {
  if (!show || !selectedOrg) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Generar campaña para {selectedOrg.nombre}</h2>
        <div className="space-y-4">
          {Object.entries(tiposCampana).map(([key, campana]) => (
            <div
              key={key}
              onClick={() => !isSending && setSelectedCampaignType(key)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCampaignType === key
                ? 'border-blue-700 dark:border-blue-200 bg-blue-200 dark:bg-blue-700'
                : 'border-gray-300 dark:border-gray-500 hover:border-gray-500 dark:hover:border-gray-300'
              } ${isSending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <h4 className="font-semibold dark:text-gray-100">{campana.nombre}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{campana.descripcion}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:text-gray-200"
          >
            Cancelar
          </button>

          <button
            onClick={onSend}
            disabled={!selectedCampaignType || isSending}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-400 text-white dark:text-black rounded-lg disabled:opacity-50"
          >
            {isSending ? 'Enviando...' : 'Enviar campaña'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendCampaignModal;