// import React, { useState } from 'react';
// import { Users, Eye, Mail, Building, X, Zap } from 'lucide-react'; // Importar Zap
// import { metricas, organizaciones, tiposCampana, campanasActivas, estadosData, islasData, sectoresData } from './data/data';
// import Dashboard from './components/Dashboard';
// import OrganizationList from './components/OrganizationList';
// import OrganizationDetail from './components/OrganizationDetail';
// import Campaigns from './components/Campaigns';
// import EditOrganizationModal from './components/EditOrganizationModal';
// import SendCampaignModal from './components/SendCampaignModal';
// import ThemeSwitcher from './components/ThemeSwitcher';

// const App = () => {
//   const [activeView, setActiveView] = useState('listado');
//   const [selectedOrg, setSelectedOrg] = useState(null);
//   const [filterStatus, setFilterStatus] = useState('todos');
//   const [filterType, setFilterType] = useState('todos');
//   const [showCampaignModal, setShowCampaignModal] = useState(false);
//   const [selectedCampaignType, setSelectedCampaignType] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingOrg, setEditingOrg] = useState(null);
//   const [isIndicatorCollapsed, setIsIndicatorCollapsed] = useState(false);

//   const openEditModal = (org) => {
//     setEditingOrg({ ...org });
//     setShowEditModal(true);
//   };

//   const saveEditedOrg = () => {
//     console.log('Guardando cambios para:', editingOrg);
//     if (selectedOrg && selectedOrg.id === editingOrg.id) {
//       setSelectedOrg({ ...editingOrg });
//     }
//     setShowEditModal(false);
//     setEditingOrg(null);
//   };

//   const renderView = () => {
//     switch (activeView) {
//       case 'dashboard':
//         return <Dashboard metricas={metricas} estadosData={estadosData} islasData={islasData} sectoresData={sectoresData} />;
//       case 'listado':
//         return (
//           <OrganizationList
//             organizaciones={organizaciones}
//             filterStatus={filterStatus}
//             setFilterStatus={setFilterStatus}
//             filterType={filterType}
//             setFilterType={setFilterType}
//             setSelectedOrg={setSelectedOrg}
//             setActiveView={setActiveView}
//             openEditModal={openEditModal}
//             setShowCampaignModal={setShowCampaignModal}
//           />
//         );
//       case 'detalle':
//         return <OrganizationDetail selectedOrg={selectedOrg} setShowCampaignModal={setShowCampaignModal} openEditModal={openEditModal} />;
//       case 'campanas':
//         return <Campaigns campanasActivas={campanasActivas} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       {/* Header y Navegación */}
//       <div className="bg-white border-b shadow-sm dark:bg-gray-800">
//         <div className="px-6 py-4">
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NotasCan - Centro de enriquecimiento automático</h1>
//           <p className="text-gray-600 dark:text-gray-400">Transformando {metricas.total_organizaciones} organizaciones en la base de datos comercial más precisa de Canarias</p>
//         </div>

//           {/* Para cambiar el tema */}
//           <ThemeSwitcher />
//       </div>
//       <div className="px-6 bg-white dark:bg-gray-600 border-b">
//         <div className="flex space-x-8">
//           {[
//             { id: 'listado', label: 'Gestión de organizaciones', icon: Users },
//             { id: 'detalle', label: 'Detalle de organización', icon: Eye },
//             { id: 'campanas', label: 'Campañas activas', icon: Mail },
//             { id: 'dashboard', label: 'Panel general', icon: Building }
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveView(tab.id)}
//               className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
//                 activeView === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-300' : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900'
//               }`}
//             >
//               <tab.icon size={18} />
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div className="p-6">{renderView()}</div>

//       {/* Modales */}
//       <SendCampaignModal
//         show={showCampaignModal}
//         onClose={() => setShowCampaignModal(false)}
//         selectedOrg={selectedOrg}
//         tiposCampana={tiposCampana}
//         selectedCampaignType={selectedCampaignType}
//         setSelectedCampaignType={setSelectedCampaignType}
//       />
//       <EditOrganizationModal
//         show={showEditModal}
//         onClose={() => setShowEditModal(false)}
//         editingOrg={editingOrg}
//         setEditingOrg={setEditingOrg}
//         onSave={saveEditedOrg}
//       />

//       {/* Indicador (colapsable) */}
//       <div
//         className={`fixed bottom-6 right-6 shadow-lg transition-all duration-300 ease-in-out ${
//           isIndicatorCollapsed
//             ? 'w-14 h-14 rounded-full bg-green-800 dark:bg-green-400 flex items-center justify-center cursor-pointer hover:bg-green-600 dark:hover:bg-green-800'
//             : 'max-w-sm p-4 bg-white dark:bg-black border-l-4 border-green-500 dark:border-green-700 rounded-lg'
//         }`}
//         onClick={() => {
//           if (isIndicatorCollapsed) {
//             setIsIndicatorCollapsed(false);
//           }
//         }}
//       >
//         {isIndicatorCollapsed ? (
//           <Zap className="text-white" size={24} />
//         ) : (
//           <>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setIsIndicatorCollapsed(true);
//               }}
//               className="absolute text-gray-400 top-2 right-2 hover:text-gray-600"
//             >
//               <X size={18} />
//             </button>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//               <h4 className="font-semibold text-gray-900 dark:text-gray-400">Sistema activo</h4>
//             </div>
//             <div className="text-sm text-gray-600 dark:text-gray-300">
//               <div>• IA procesando: 12 organizaciones</div>
//               <div>• Automatización: {metricas.automatizacion}% activa</div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default App;




import React, { useState, useEffect } from 'react';
import { Users, Eye, Mail, Building } from 'lucide-react';
import { metricas, tiposCampana, campanasActivas, estadosData, islasData, sectoresData } from './data/data';
import apiClient from './api/apiClient';
import Dashboard from './components/Dashboard';
import OrganizationList from './components/OrganizationList';
import OrganizationDetail from './components/OrganizationDetail';
import Campaigns from './components/Campaigns';
import EditOrganizationModal from './components/EditOrganizationModal';
import SendCampaignModal from './components/SendCampaignModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import AIindicator from './components/AIindicator';

const App = () => {
  const [activeView, setActiveView] = useState('listado');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  
  // CAMBIO 4: Nuevos estados para gestionar la carga de datos
  const [organizaciones, setOrganizaciones] = useState([]); // Inicia vacío
  const [isLoading, setIsLoading] = useState(true); // Inicia cargando
  const [error, setError] = useState(null); // Inicia sin errores

  // CAMBIO 5: Hook useEffect para llamar a la API al cargar la app
  useEffect(() => {
    const fetchOrganizaciones = async () => {
      try {
        // Usamos nuestro apiClient para llamar a la ruta del endpoint
        // ¡Recuerda usar la ruta de tu webhook de PRODUCCIÓN aquí para el futuro!
        const response = await apiClient.get('/webhook/3d99f525-7267-4b7c-9f79-ce91f3a3d3cd');
        
        // axios pone los datos directamente en la propiedad 'data'
        setOrganizaciones(response.data);
      } catch (err) {
        // Si hay un error, lo guardamos para mostrar un mensaje
        setError(err);
      } finally {
        // Haya éxito o error, terminamos de cargar
        setIsLoading(false);
      }
    };

    fetchOrganizaciones();
  }, []); // El arreglo vacío [] asegura que esto se ejecute solo una vez


  const openEditModal = (org) => {
    setEditingOrg({ ...org });
    setShowEditModal(true);
  };

  const saveEditedOrg = () => {
    console.log('Guardando cambios para:', editingOrg);
    if (selectedOrg && selectedOrg.id === editingOrg.id) {
      setSelectedOrg({ ...editingOrg });
    }
    setShowEditModal(false);
    setEditingOrg(null);
  };
  
  // ¡Ojo! Pasamos la variable de estado 'organizaciones' a este componente.
  // Ahora contendrá los datos de la API, no los de prueba.
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard metricas={metricas} estadosData={estadosData} islasData={islasData} sectoresData={sectoresData} />;
      case 'listado':
        return (
          <OrganizationList
            organizaciones={organizaciones} 
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            setSelectedOrg={setSelectedOrg}
            setActiveView={setActiveView}
            openEditModal={openEditModal}
            setShowCampaignModal={setShowCampaignModal}
          />
        );
      case 'detalle':
        return <OrganizationDetail selectedOrg={selectedOrg} setShowCampaignModal={setShowCampaignModal} openEditModal={openEditModal} />;
      case 'campanas':
        return <Campaigns campanasActivas={campanasActivas} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ... (resto del JSX no cambia, excepto el área de contenido) ... */}
      <div className="bg-white border-b shadow-sm dark:bg-gray-800">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NotasCan - Centro de enriquecimiento automático</h1>
          <p className="text-gray-600 dark:text-gray-400">Transformando {metricas.total_organizaciones} organizaciones en la base de datos comercial más precisa de Canarias</p>
        </div>
        <ThemeSwitcher />
      </div>
      <div className="px-6 bg-white dark:bg-gray-600 border-b">
        <div className="flex space-x-8">
          {[
            { id: 'listado', label: 'Gestión de organizaciones', icon: Users },
            { id: 'detalle', label: 'Detalle de organización', icon: Eye },
            { id: 'campanas', label: 'Campañas activas', icon: Mail },
            { id: 'dashboard', label: 'Panel general', icon: Building }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeView === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-300' : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* CAMBIO 6: Renderizado condicional del contenido principal */}
      <div className="p-6">
        {isLoading && <p className="text-center text-gray-500 dark:text-gray-400">Cargando organizaciones...</p>}
        {error && <p className="text-center text-red-500">Error al cargar los datos: {error.message}</p>}
        {!isLoading && !error && renderView()}
      </div>

      <SendCampaignModal
        show={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        selectedOrg={selectedOrg}
        tiposCampana={tiposCampana}
        selectedCampaignType={selectedCampaignType}
        setSelectedCampaignType={setSelectedCampaignType}
      />
      <EditOrganizationModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        editingOrg={editingOrg}
        setEditingOrg={setEditingOrg}
        onSave={saveEditedOrg}
      />

      <AIindicator />
    </div>
  );
};

export default App;