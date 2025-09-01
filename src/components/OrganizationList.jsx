import { Search, Eye, Edit, Mail, Zap, RefreshCw, HelpCircle } from 'lucide-react';
import StatusBadge from './shared/StatusBadge';

const OrganizationList = ({
  organizaciones,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  setSelectedOrg,
  setActiveView,
  openEditModal,
  setShowCampaignModal,
  onRefresh,
}) => {
  // Nota: La lógica de filtrado deberá ajustarse para que coincida con los nuevos datos de la API.
  // Por ejemplo, el filtro de estado ahora debería usar los valores numéricos (1, 2, 3).
  const filteredOrgs = organizaciones;
    // .filter(org => filterStatus === 'todos' || org.estado_cliente === parseInt(filterStatus))
    // .filter(org => filterType === 'todos' || org.tipo === filterType);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute text-gray-400 left-3 top-3" size={20} />
              <input
                type="text"
                placeholder="Buscar organización..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="todos">Todos los estados</option>
            <option value="1">Completadas</option>
            <option value="2">En revisión</option>
            <option value="3">Pendientes</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="todos">Todos los tipos</option>
            <option value="Administración Pública">Público</option>
            <option value="Empresa">Empresas</option>
            <option value="Agencia">Agencias</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Refrescar datos"
            >
              <RefreshCw size={18} />
            </button>
            <div title="Fuerza la recarga de datos desde el servidor. Los datos se actualizan automáticamente cada 3 horas.">
              <HelpCircle size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Organización</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Contacto</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Ubicación</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Estado</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Último Posteo</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{org.organizacion || org.nombre}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{org.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{org.nombres_org || '[sin contacto]'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{org.rol}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
                  {org.municipio && org.isla ? `${org.municipio}, ${org.isla}` : 'Por determinar'}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge estado={org.estado_cliente} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
                  {org.ultimo_posteo}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setActiveView('detalle');
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(org)}
                      className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setShowCampaignModal(true);
                      }}
                      className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      title="Enviar email"
                    >
                      <Mail size={16} />
                    </button>
                    {org.estado_cliente === 3 && (
                      <button className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300" title="Procesar con IA">
                        <Zap size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationList;