import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Edit, Mail, Zap, RefreshCw, HelpCircle, RotateCcw, Download } from 'lucide-react';
import StatusBadge from './shared/StatusBadge';
import Pagination from './shared/Pagination';
import { getEntityType, ESTADOS_CLIENTE } from '../utils/organizationUtils';
import { getElapsedString } from '../utils/dateUtils';

const OrganizationList = ({
  organizaciones,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  // Nuevos filtros
  filterIsla,
  setFilterIsla,
  filterSuscripcion,
  setFilterSuscripcion,
  // Fin nuevos filtros
  lastRefreshTs,
  openEditModal,
  viewDetail,
  openCampaign,
  currentPage,
  setCurrentPage,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
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
  };

  const isClean =
    searchTerm === '' &&
    filterStatus === 'todos' &&
    filterType === 'todos' &&
    filterIsla === 'todos' &&
    filterSuscripcion === 'todos';

  const handleExportCSV = () => {
    const headers = [
      'id',
      'organizacion',
      'nombre',
      'isla',
      'municipio',
      'estado_cliente',
      'nombres_org',
      'rol',
      'telefono',
      'ultimo_posteo',
      'suscripcion',
      'tipo_entidad'
    ];
    const lines = [headers.join(',')];
    filteredOrgs.forEach((org) => {
      const row = [
        org.id ?? '',
        (org.organizacion ?? '').toString().replaceAll(',', ' '),
        (org.nombre ?? '').toString().replaceAll(',', ' '),
        (org.isla ?? '').toString().replaceAll(',', ' '),
        (org.municipio ?? '').toString().replaceAll(',', ' '),
        org.estado_cliente ?? '',
        (org.nombres_org ?? '').toString().replaceAll(',', ' '),
        (org.rol ?? '').toString().replaceAll(',', ' '),
        (org.telefono ?? '').toString().replaceAll(',', ' '),
        (org.ultimo_posteo ?? '').toString().replaceAll(',', ' '),
        (org.suscripcion ?? '').toString().replaceAll(',', ' '),
        (getEntityType(org) || '').toString().replaceAll(',', ' '),
      ];
      lines.push(row.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date();
    const stamp = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
    link.download = `organizaciones_export_${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType, filterIsla, filterSuscripcion, setCurrentPage]);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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

          <div className="flex">
            {/* Buscador */}
            <div className="relative lg:col-span-2 w-full">
              <Search className="absolute text-gray-400 left-3 top-3" size={20} />
              <input
                type="text"
                placeholder="Buscar por organización, contacto, email..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2 lg:col-start-5 ml-4">
              <button
                onClick={handleClearFilters}
                disabled={isClean}
                className="p-2 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-700"
                title="Limpiar filtros y búsqueda"
              >
                <RotateCcw size={18} />
              </button>

              <div className="flex">
                <button
                  onClick={onRefresh}
                  className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Refrescar listado de Organizaciones"
                >
                  <RefreshCw size={18} />
                </button>

                <button
                  onClick={handleExportCSV}
                  className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Exportar CSV (filtros aplicados)"
                >
                  <Download size={18} />
                </button>

                <div
                  className="my-auto"
                  title={`Actualizado ${lastRefreshLabel ? 'hace ' + lastRefreshLabel : 'recientemente'}. Se actualiza automáticamente cada 3 horas.`}
                >
                  <HelpCircle size={18} className="text-gray-400" />
                </div>
              </div>
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
          <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
            {paginatedOrgs.map((org) => (
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
                    <button onClick={() => viewDetail(org)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Ver detalle">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => openEditModal(org)} className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => openCampaign(org)} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-3
                    00" title="Enviar email">
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
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredOrgs.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  );
};

export default OrganizationList;