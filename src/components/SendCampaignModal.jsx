import React from 'react';

const SendCampaignModal = ({
  show,
  onClose,
  selectedOrg,
  tiposCampana,
  selectedCampaignType,
  setSelectedCampaignType
}) => {
  if (!show || !selectedOrg) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Generar campaña para {selectedOrg.nombre}</h2>
        <div className="space-y-4">
          {Object.entries(tiposCampana).map(([key, campana]) => (
            <div
              key={key}
              onClick={() => setSelectedCampaignType(key)}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedCampaignType === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <h4 className="font-semibold">{campana.nombre}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{campana.descripcion}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancelar
          </button>
          <button
            disabled={!selectedCampaignType}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Enviar campaña
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendCampaignModal;