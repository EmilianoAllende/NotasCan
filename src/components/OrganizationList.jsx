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
  const filteredOrgs = organizaciones
    .filter(org => filterStatus === 'todos' || org.estado === filterStatus)
    .filter(org => filterType === 'todos' || org.tipo === filterType);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar organización..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="todos">Todos los estados</option>
            <option value="completo">Completadas</option>
            <option value="revision">En revisión</option>
            <option value="pendiente">Pendientes</option>
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

          <div className="flex items-center border rounded-md border-gray-300 dark:border-gray-600 ">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Refrescar datos"
            >
              <RefreshCw size={18} />
            </button>
            <div title="Fuerza la recarga de datos desde el servidor. Los datos se actualizan automáticamente cada 3 horas." className='p-2'>
              <HelpCircle size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Organización</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ubicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Último correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{org.nombre}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{org.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {org.contacto && (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{org.contacto.nombre}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{org.contacto.cargo}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">{org.contacto.telefono}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
                  {org.municipio && org.isla ? `${org.municipio}, ${org.isla}` : 'Por determinar'}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge estado={org.estado} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
                  {org.ultimo_correo}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setActiveView('detalle');
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(org)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setShowCampaignModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-1"
                      title="Enviar email"
                    >
                      <Mail size={16} />
                    </button>
                    {org.estado === 'pendiente' && (
                      <button className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 p-1" title="Procesar con IA">
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