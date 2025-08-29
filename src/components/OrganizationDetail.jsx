import React from 'react';
import { Mail, Edit, Zap, CheckCircle, Globe, Download } from 'lucide-react';
import StatusBadge from './shared/StatusBadge';

const OrganizationDetail = ({ selectedOrg, setShowCampaignModal, openEditModal }) => {
  if (!selectedOrg) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Selecciona una organización para ver sus detalles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedOrg.nombre}</h2>
            <p className="text-gray-600">{selectedOrg.email}</p>
          </div>
          <StatusBadge estado={selectedOrg.estado} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-500">Municipio</p>
            <p className="font-medium">{selectedOrg.municipio || 'Por determinar'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Isla</p>
            <p className="font-medium">{selectedOrg.isla || 'Por determinar'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tipo</p>
            <p className="font-medium">{selectedOrg.tipo || 'Sin clasificar'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sector</p>
            <p className="font-medium">{selectedOrg.sector || 'Sin clasificar'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Último correo enviado</p>
            <p className="font-medium">{selectedOrg.ultimo_correo}</p>
          </div>
        </div>
      </div>
      {selectedOrg.contacto && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Información de contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Contacto principal</p>
              <p className="font-medium">{selectedOrg.contacto.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cargo</p>
              <p className="font-medium">{selectedOrg.contacto.cargo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Teléfono</p>
              <p className="font-medium text-blue-600">{selectedOrg.contacto.telefono}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad comunicacional</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Notas este trimestre:</span>
              <span className="font-bold text-blue-600">{selectedOrg.notas_trimestre}</span>
            </div>
            <div className="flex justify-between">
              <span>Frecuencia:</span>
              <span className="font-medium">{selectedOrg.frecuencia}</span>
            </div>
            <div className="flex justify-between">
              <span>Última nota:</span>
              <span className="font-medium">{selectedOrg.ultima_nota}</span>
            </div>
            <div className="flex justify-between">
              <span>Último correo enviado:</span>
              <span className="font-medium">{selectedOrg.ultimo_correo}</span>
            </div>
            {selectedOrg.confianza_ia > 0 && (
              <div className="flex justify-between">
                <span>Confianza IA:</span>
                <span className="font-bold text-green-600">{selectedOrg.confianza_ia}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Temas principales</h3>
          <div className="space-y-2">
            {selectedOrg.tendencia_temas.length > 0 ? (
              selectedOrg.tendencia_temas.map((tema, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2"
                >
                  {tema}
                </span>
              ))
            ) : (
              <p className="text-gray-500 italic">Análisis pendiente</p>
            )}
          </div>
        </div>
      </div>
      {selectedOrg.estado === 'completo' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            <Mail className="inline mr-2" size={20} />
            Sugerencia de email marketing personalizado
          </h3>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-gray-800 leading-relaxed">
              "Detectamos que <strong>{selectedOrg.nombre}</strong> ha intensificado su comunicación sobre{' '}
              <strong>{selectedOrg.tendencia_temas[0]?.toLowerCase()}</strong> este trimestre
              ({selectedOrg.notas_trimestre} comunicaciones). ¿Os interesaría un análisis detallado del
              impacto mediático de vuestras iniciativas en {selectedOrg.isla}?"
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowCampaignModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generar campaña
            </button>
            <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50">
              Personalizar mensaje
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones disponibles</h3>
        <div className="flex gap-3">
          <button
            onClick={() => openEditModal(selectedOrg)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Edit size={16} />
            Editar organización
          </button>
          {selectedOrg.estado === 'pendiente' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Zap size={16} />
              Procesar con IA
            </button>
          )}
          {selectedOrg.estado === 'revision' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <CheckCircle size={16} />
              Aprobar clasificación
            </button>
          )}
          <button
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Mail size={16} />
            Enviar email
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Globe size={16} />
            Ver en mapa
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download size={16} />
            Exportar datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetail;