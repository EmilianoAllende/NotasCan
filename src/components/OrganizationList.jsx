import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Edit, Mail, Zap, RefreshCw, RotateCcw } from 'lucide-react';
// import StatusBadge from './shared/StatusBadge';
// import Pagination from './shared/Pagination';
// import { getEntityType, ESTADOS_CLIENTE } from '../utils/organizationUtils';
// import { getElapsedString } from '../utils/dateUtils';

// --- INICIO DE COMPONENTES SIMULADOS (MOCKS) ---
// Se añaden para que el archivo se pueda previsualizar sin errores.

const StatusBadge = ({ estado }) => {
  let text = 'Pendiente';
  let color = 'bg-gray-100 text-gray-800';
  if (estado === 1) {
    text = 'En revisión';
    color = 'bg-yellow-100 text-yellow-800';
  } else if (estado === 2) {
    text = 'Completado';
    color = 'bg-green-100 text-green-800';
  }
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {text}
    </span>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // --- CAMBIO: Limpiar selección al cambiar de página ---
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded-lg disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-sm">
        Página {currentPage} de {totalPages}
      </span>
      <button 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded-lg disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );
};

const ESTADOS_CLIENTE = {
  PENDIENTE: 0,
  EN_REVISION: 1,
  COMPLETADO: 2,
};

const getEntityType = (org) => {
  if (org.tipo === 'publico') return 'Administración Pública';
  if (org.tipo === 'asociacion') return 'Asociación';
  return 'Empresa';
};

const getElapsedString = (timestamp) => {
  const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `hace ${Math.floor(interval)} años`;
  interval = seconds / 2592000;
  if (interval > 1) return `hace ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `hace ${Math.floor(interval)} días`;
  interval = seconds / 3600;
  if (interval > 1) return `hace ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
  return `hace ${Math.floor(seconds)} segundos`;
};
// --- FIN DE COMPONENTES SIMULADOS ---


const OrganizationList = ({
  organizaciones,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  filterIsla,
  setFilterIsla,
  filterSuscripcion,
  setFilterSuscripcion,
  lastRefreshTs,
  openEditModal,
  viewDetail,
  openCampaign,
  currentPage,
  setCurrentPage,
  onRefresh,
  startCallCenterMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedOrgIds, setSelectedOrgIds] = useState(new Set()); // --- NUEVO ESTADO ---
  const ITEMS_PER_PAGE = 25;

  // Etiqueta dinámica para el tiempo transcurrido desde la última actualización
  const [lastRefreshLabel, setLastRefreshLabel] = useState('');

  useEffect(() => {
    if (!lastRefreshTs) { setLastRefreshLabel(''); return; }
    const update = () => setLastRefreshLabel(getElapsedString(lastRefreshTs));
    update();
    const id = setInterval(update, 60000); // Actualiza cada minuto
    return () => clearInterval(id);
  }, [lastRefreshTs]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('todos');
    setFilterType('todos');
    setFilterIsla('todos');
    setFilterSuscripcion('todos');
    setCurrentPage(1);
    setSelectedOrgIds(new Set()); // --- NUEVO ---
  };

  const isClean =
    searchTerm === '' &&
    filterStatus === 'todos' &&
    filterType === 'todos' &&
    filterIsla === 'todos' &&
    filterSuscripcion === 'todos';

  // Lista de islas para el selector del filtro
  const islasCanarias = [
    'Gran Canaria', 'Tenerife', 'Lanzarote', 'Fuerteventura',
    'La Palma', 'La Gomera', 'El Hierro', 'Canarias'
  ];

  const filteredOrgs = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return organizaciones.filter(org => {
      const matchesSearch = lowercasedSearchTerm === '' ? true : (
        (org.organizacion || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (org.nombre || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (org.id || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (org.nombres_org || '').toLowerCase().includes(lowercasedSearchTerm)
      );
      
      const matchesStatus = filterStatus === 'todos' ? true : org.estado_cliente === filterStatus;

      const tipoEntidad = getEntityType(org);
      const matchesType = filterType === 'todos' ? true : tipoEntidad === filterType;
      const matchesIsla = filterIsla === 'todos' ? true : org.isla === filterIsla;
      const matchesSuscripcion = filterSuscripcion === 'todos' ? true : org.suscripcion === filterSuscripcion;

      return matchesSearch && matchesStatus && matchesType && matchesIsla && matchesSuscripcion;
    });
  }, [organizaciones, searchTerm, filterStatus, filterType, filterIsla, filterSuscripcion]);

  const totalPages = Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE);
  
  const paginatedOrgs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOrgs.slice(startIndex, endIndex);
  }, [filteredOrgs, currentPage, ITEMS_PER_PAGE]);

  // --- LÓGICA DE SELECCIÓN ---
  const paginatedOrgIds = useMemo(() => new Set(paginatedOrgs.map(org => org.id)), [paginatedOrgs]);
  const areAllOnPageSelected = paginatedOrgs.length > 0 && [...paginatedOrgIds].every(id => selectedOrgIds.has(id));

  const handleSelectAll = () => {
    setSelectedOrgIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (areAllOnPageSelected) {
        // Deseleccionar todos en esta página
        paginatedOrgIds.forEach(id => newSelected.delete(id));
      } else {
        // Seleccionar todos en esta página
        paginatedOrgIds.forEach(id => newSelected.add(id));
      }
      return newSelected;
    });
  };

  const handleSelectOrg = (orgId) => {
    setSelectedOrgIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(orgId)) {
        newSelected.delete(orgId);
      } else {
        newSelected.add(orgId);
      }
      return newSelected;
    });
  };

  // Helper para pasar las orgs seleccionadas al modo call center
  const getSelectedOrgs = () => {
    return organizaciones.filter(org => selectedOrgIds.has(org.id));
  };
  
  // --- CAMBIO DE LÓGICA: Mínimo 2 organizaciones ---
  const isCallCenterDisabled = selectedOrgIds.size < 2;

  // Reset to page 1 and clear selection when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrgIds(new Set()); // --- NUEVO ---
  }, [searchTerm, filterStatus, filterType, filterIsla, filterSuscripcion, setCurrentPage]);

  // Clear selection when page changes
  useEffect(() => {
    setSelectedOrgIds(new Set());
  }, [currentPage]);


  const isLoading = organizaciones.length === 0;

  return (
  <div className="max-w-9x2 mx-auto px-1 sm:px-4 lg:px-1 py-1">
  <div className="p-4 sm:p-5 bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <div className="grid gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {/* Estado */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="todos">Todos los estados</option>
              <option value={ESTADOS_CLIENTE.COMPLETADO}>Completado</option>
              <option value={ESTADOS_CLIENTE.EN_REVISION}>En revisión</option>
              <option value={ESTADOS_CLIENTE.PENDIENTE}>Pendiente</option>
            </select>

            {/* Tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="todos">Todos los tipos</option>
              <option value="Administración Pública">Público</option>
              <option value="Empresa">Empresa</option>
              <option value="Asociación">Asociación</option>
            </select>

            {/* Isla */}
            <select
              value={filterIsla}
              onChange={(e) => setFilterIsla(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="todos">Todas las islas</option>
              {islasCanarias.map((isla) => (
                <option key={isla} value={isla}>{isla}</option>
              ))}
            </select>

 
            {/* Suscripción */}
            <select
              value={filterSuscripcion}
              onChange={(e) => setFilterSuscripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="todos">Todas las suscripciones</option>
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Buscar organizaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    ×
                  </span>
                </button>
              )}
            </div>

            <div className="ml-4 flex space-x-2">
              {startCallCenterMode && ( 
                <button
                  onClick={() => startCallCenterMode(getSelectedOrgs())}
                  // --- LÓGICA DE DESHABILITADO ACTUALIZADA ---
                  disabled={isCallCenterDisabled}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  title={
                    isCallCenterDisabled 
                      ? "Selecciona al menos 2 organizaciones para continuar."
                      : `Iniciar Modo Call Center con ${selectedOrgIds.size} organizaciones`
                  }
                  // --- FIN DE LÓGICA ---
                >
                  <Zap className="h-4 w-4" />
                  Modo Call Center ({selectedOrgIds.size})
                </button>
              )}
              <button
                onClick={handleClearFilters}
                disabled={isClean}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  isClean
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={onRefresh}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Actualizar datos"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {!isClean && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {filteredOrgs.length} de {organizaciones.length} organizaciones
              {searchTerm && ` que coinciden con "${searchTerm}"`}
              {filterStatus !== 'todos' && `, estado: ${
                filterStatus === ESTADOS_CLIENTE.COMPLETADO ? 'Completado' :
                filterStatus === ESTADOS_CLIENTE.EN_REVISION ? 'En revisión' :
                filterStatus === ESTADOS_CLIENTE.PENDIENTE ? 'Pendiente' : filterStatus
              }`}
              {filterType !== 'todos' && `, tipo: ${filterType}`}
              {filterIsla !== 'todos' && `, isla: ${filterIsla}`}
              {filterSuscripcion !== 'todos' && `, suscripción: ${filterSuscripcion}`}
              <button
                onClick={handleClearFilters}
                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                (Limpiar filtros)
              </button>
            </div>
          )}

          {lastRefreshLabel && (
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              Última actualización: {lastRefreshLabel}
            </div>
          )}
        </div>

        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {/* --- ESTILOS DE CHECKBOX REVERTIDOS --- */}
                  <th scope="col" className="relative py-3.5 pl-4 pr-3 sm:pl-6">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAll}
                      disabled={paginatedOrgs.length === 0}
                      title="Seleccionar todos en esta página"
                    />
                  </th>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Organización
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Contacto
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Último contacto
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {paginatedOrgs.length > 0 ? (
                  paginatedOrgs.map((org) => (
                    <tr 
                      key={org.id} 
                      className={`${
                        selectedOrg?.id === org.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      } ${selectedOrgIds.has(org.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} // Resaltar seleccionados
                    >
                      {/* --- ESTILOS DE CHECKBOX REVERTIDOS --- */}
                      <td className="relative py-4 pl-4 pr-3 sm:pl-6">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                          checked={selectedOrgIds.has(org.id)}
                          onChange={() => handleSelectOrg(org.id)}
                        />
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <span 
                            className={`inline-block h-3 w-3 rounded-full mr-2 ${
                              org.estado_cliente === ESTADOS_CLIENTE.COMPLETADO 
                                ? 'bg-green-500' 
                                : org.estado_cliente === ESTADOS_CLIENTE.EN_REVISION 
                                  ? 'bg-yellow-500' 
                                  : 'bg-gray-300'
                            }`}
                            title={
                              org.estado_cliente === ESTADOS_CLIENTE.COMPLETADO 
                                ? 'Completado' 
                                : org.estado_cliente === ESTADOS_CLIENTE.EN_REVISION 
                                  ? 'En revisión' 
                                  : 'Pendiente'
                            }
                          />
                          {org.organizacion || org.nombre || 'Sin nombre'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {org.sector || 'Sin sector'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <div>{org.nombres_org || 'Sin contacto'}</div>
                        {org.cargo && (
                          <div className="text-xs text-gray-400">{org.cargo}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <StatusBadge estado={org.estado_cliente} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {org.ultimo_contacto 
                          ? new Date(org.ultimo_contacto).toLocaleDateString() 
                          : 'Nunca'}
                        {org.hace_dias !== undefined && org.hace_dias !== null && (
                          <div className="text-xs text-gray-400">
                            Hace {org.hace_dias} días
                          </div>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrg(org);
                              viewDetail(org);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrg(org);
                              openEditModal(org);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrg(org);
                              openCampaign(org);
                            }}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Enviar campaña"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"> {/* ColSpan aumentado a 6 */}
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                          Cargando organizaciones...
                        </div>
                      ) : (
                        'No se encontraron organizaciones que coincidan con los filtros seleccionados.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando{' '}
            {paginatedOrgs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} -{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrgs.length)} de{' '}
            {filteredOrgs.length} organizaciones.
            <span className="ml-2 font-medium">({selectedOrgIds.size} seleccionadas)</span>
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationList;

