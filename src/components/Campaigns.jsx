import React from 'react';
import { Eye, Edit, RefreshCw } from 'lucide-react';

const Campaigns = ({ campanasActivas }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-300 mb-4">Campañas enviadas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-950 rounded-md">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Organización</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Asunto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Métricas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-500 dark:text-gray-300">
              {campanasActivas.map((campana) => (
                <tr key={campana.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium">{campana.organizacion}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      {campana.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-gray-300">{campana.asunto}</span>
                  </td>
                  <td className="px-6 py-4">{campana.fecha_envio}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                      {campana.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4 text-xs">
                      <span className={`${campana.abierto ? 'text-green-600 dark:text-green-500' : 'text-gray-400 dark:text-gray-600'}`}>
                        {campana.abierto ? 'Abierto' : 'No abierto'}
                      </span>
                      <span className={`${campana.respondido ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-600'}`}>
                        {campana.respondido ? 'Respondido' : 'Sin respuesta'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                        title="Ver detalle"
                        onClick={() => console.log('Ver detalle de campaña:', campana.id)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-300 p-1"
                        title="Editar campaña"
                        onClick={() => console.log('Editar campaña:', campana.id)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-purple-600 dark:text-purple-500 hover:text-purple-800 dark:hover:text-purple-300 p-1"
                        title="Reenviar"
                        onClick={() => console.log('Reenviar campaña:', campana.id)}
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-300 mb-2">Resumen de rendimiento</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{campanasActivas.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Campañas enviadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">67%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de apertura</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">33%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de respuesta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;