// import React, { useState, useMemo } from 'react';
// import { Search, Eye, Edit, Mail, Zap, RefreshCw, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
// import StatusBadge from './shared/StatusBadge';

// const ITEMS_PER_PAGE = 25;

// const OrganizationList = ({
//   organizaciones,
//   filterStatus,
//   setFilterStatus,
//   filterType,
//   setFilterType,
//   setSelectedOrg,
//   setActiveView,
//   openEditModal,
//   setShowCampaignModal,
//   onRefresh,
//   currentPage,
//   setCurrentPage,
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');

//   const filteredOrgs = useMemo(() => {
//     const lowercasedSearchTerm = searchTerm.toLowerCase();
//     if (!organizaciones) return [];
//     return organizaciones.filter(org => {
//       const matchesSearch = lowercasedSearchTerm === '' ? true : (
//         (org.organizacion || '').toLowerCase().includes(lowercasedSearchTerm) ||
//         (org.nombre || '').toLowerCase().includes(lowercasedSearchTerm) ||
//         (org.id || '').toLowerCase().includes(lowercasedSearchTerm) ||
//         (org.nombres_org || '').toLowerCase().includes(lowercasedSearchTerm)
//       );
//       const matchesStatus = filterStatus === 'todos' ? true : org.estado_cliente === parseInt(filterStatus);
//       let tipoEntidad = '';
//       try {
//         if (typeof org.metadata === 'string' && org.metadata !== 'indefinido') {
//           const parsedMeta = JSON.parse(org.metadata);
//           tipoEntidad = parsedMeta?.organizacion?.tipo || '';
//         }
//       } catch (e) {}
//       const matchesType = filterType === 'todos' ? true : tipoEntidad === filterType;
//       return matchesSearch && matchesStatus && matchesType;
//     });
//   }, [organizaciones, searchTerm, filterStatus, filterType]);

//   const totalPages = Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE);
//   const paginatedOrgs = filteredOrgs.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );

//   return (
//     <div className="space-y-6">
//       <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
//         <div className="flex flex-wrap items-center gap-4">
//           <div className="flex-1 min-w-[200px]">
//             <div className="relative">
//               <Search className="absolute text-gray-400 left-3 top-3" size={20} />
//               <input
//                 type="text"
//                 placeholder="Buscar por organización, contacto, email..."
//                 className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               />
//             </div>
//           </div>
//           <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
//             <option value="todos">Todos los estados</option>
//             <option value="1">Completado</option>
//             <option value="2">En revisión</option>
//             <option value="3">Pendiente</option>
//           </select>
//           <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
//             <option value="todos">Todos los tipos</option>
//             <option value="Administración Pública">Público</option>
//             <option value="Empresa">Empresa</option>
//             <option value="Asociación">Asociación</option>
//           </select>
//           <div className="flex items-center gap-2">
//             <button onClick={onRefresh} className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Refrescar datos">
//               <RefreshCw size={18} />
//             </button>
//             <div title="Fuerza la recarga de datos. La caché expira cada 3 horas.">
//               <HelpCircle size={18} className="text-gray-400" />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
//         <table className="w-full">
//           <thead className="bg-gray-50 dark:bg-gray-700">
//             <tr>
//               <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Organización</th>
//               <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Contacto</th>
//               <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Ubicación</th>
//               <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Estado</th>
//               <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Último Posteo</th>
//               <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Acciones</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

//             {paginatedOrgs.map((org) => (
//               <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                 <td className="px-6 py-4">
//                   <div>
//                     <div className="font-medium text-gray-900 dark:text-gray-100">{org.organizacion || org.nombre}</div>
//                     <div className="text-sm text-gray-500 dark:text-gray-400">{org.id}</div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4">
//                   <div>
//                     <div className="font-medium text-gray-900 dark:text-gray-100">{org.nombres_org || '[sin contacto]'}</div>
//                     <div className="text-sm text-gray-500 dark:text-gray-400">{org.rol}</div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
//                   {org.municipio && org.isla ? `${org.municipio}, ${org.isla}` : 'Por determinar'}
//                 </td>
//                 <td className="px-6 py-4">
//                   <StatusBadge estado={org.estado_cliente} />
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
//                   {org.ultimo_posteo}
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex gap-2">
//                     <button onClick={() => { setSelectedOrg(org); setActiveView('detalle'); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Ver detalle">
//                       <Eye size={16} />
//                     </button>
//                     <button onClick={() => openEditModal(org)} className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300" title="Editar">
//                       <Edit size={16} />
//                     </button>
//                     <button onClick={() => { setSelectedOrg(org); setShowCampaignModal(true); }} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300" title="Enviar email">
//                       <Mail size={16} />
//                     </button>
//                     {org.estado_cliente === 3 && (
//                       <button className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300" title="Procesar con IA">
//                         <Zap size={16} />
//                       </button>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex items-center justify-between p-4">
//         <span className="text-sm text-gray-700 dark:text-gray-400">
//           Mostrando {paginatedOrgs.length} de {filteredOrgs.length} resultados
//         </span>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="p-2 text-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
//           >
//             <ChevronLeft size={20} />
//           </button>
//           <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
//             Página {currentPage} de {totalPages > 0 ? totalPages : 1}
//           </span>
//           <button
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages || totalPages === 0}
//             className="p-2 text-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
//           >
//             <ChevronRight size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrganizationList;



import React, { useState, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrgs = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return organizaciones.filter(org => {
      const matchesSearch = lowercasedSearchTerm === '' ? true : (
        (org.organizacion || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (org.nombre || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (org.id || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (org.nombres_org || '').toLowerCase().includes(lowercasedSearchTerm)
      );
      
      const matchesStatus = filterStatus === 'todos' ? true : org.estado_cliente === parseInt(filterStatus);

      let tipoEntidad = '';
      try {
        if (typeof org.metadata === 'string' && org.metadata !== 'indefinido') {
          const parsedMeta = JSON.parse(org.metadata);
          tipoEntidad = parsedMeta?.organizacion?.tipo || '';
        }
      } catch (e) { /* Ignorar errores de parseo */ }
      
      const matchesType = filterType === 'todos' ? true : tipoEntidad === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [organizaciones, searchTerm, filterStatus, filterType]);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute text-gray-400 left-3 top-3" size={20} />
              <input
                type="text"
                placeholder="Buscar por organización, contacto, email..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="todos">Todos los estados</option>
            <option value="1">Completado</option>
            <option value="2">En revisión</option>
            <option value="3">Pendiente</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="todos">Todos los tipos</option>
            <option value="Administración Pública">Público</option>
            <option value="Empresa">Empresa</option>
            <option value="Asociación">Asociación</option>
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
                    <button onClick={() => { setSelectedOrg(org); setActiveView('detalle'); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Ver detalle">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => openEditModal(org)} className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => { setSelectedOrg(org); setShowCampaignModal(true); }} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300" title="Enviar email">
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