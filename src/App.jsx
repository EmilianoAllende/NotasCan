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

// Tiempo de expiración en milisegundos (3 horas para pruebas - RECORDAR MODIFICAR)
const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000;

const App = () => {
  const [activeView, setActiveView] = useState('listado');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [organizaciones, setOrganizaciones] = useState(() => {
    const cachedData = localStorage.getItem('organizaciones_cache');
    if (!cachedData) return [];

    const { data, timestamp } = JSON.parse(cachedData);
    const isExpired = new Date().getTime() - timestamp > CACHE_EXPIRATION_MS;

    return isExpired ? [] : data; // Si está expirado, devuelve vacío para forzar la recarga
  });

  // Esto "lee" si hay organizaciones en el estado inicial, o debe cargarlas.
  const [isLoading, setIsLoading] = useState(organizaciones.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Solo ejecutamos la llamada a la API si el estado de organizaciones está vacío.
    if (organizaciones.length === 0) {
      setIsLoading(true);
      const fetchOrganizaciones = async () => {
        try {
          const response = await apiClient.get('/webhook/1d55c52f-afbb-4c02-8d16-00af17caac57');

// Esto almacena los datos junto con la marca de tiempo actual.
          const cache = {
            data: response.data,
            timestamp: new Date().getTime(),
          };
          
          // Es IMPORTANTE registrar los datos en localStorage ANTES de actualizar el estado
          localStorage.setItem('organizaciones_cache', JSON.stringify(cache));

          setOrganizaciones(response.data);
        } catch (err) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrganizaciones();
    }
  }, [organizaciones.length]); // La longitud de 'organizaciones' es el trigger.

  // Función para el refresco manual.
  const handleRefresh = () => {
    localStorage.removeItem('organizaciones_cache'); // Borram el caché específifco.
    setOrganizaciones([]); // Vaciamos el "estado" => para forzar el useEffect a que se recargue.
  };

  const openEditModal = (org) => {
    setEditingOrg({ ...org });
    setShowEditModal(true);
  };


  const saveEditedOrg = async (updatedOrg) => {
    setIsSaving(true);
    setError(null);

    // Preparamos el objeto para enviar, limpiando campos vacíos
    const orgToSend = { ...updatedOrg };
    Object.keys(orgToSend).forEach(key => {
      const value = orgToSend[key];
      if (key === 'telefono' && (value === '' || value === null || value === undefined)) {
        orgToSend[key] = 0;
      } else if (typeof value === 'string' && value === '') {
        orgToSend[key] = '[vacio]';
      }
    });

    try {
      // 1. Enviamos la actualización a n8n
      await apiClient.put(`/webhook/organizaciones`, orgToSend);

      // 2. --- CAMBIO CLAVE ---
      // Si la llamada fue exitosa, en lugar de actualizar el estado manualmente,
      // simplemente llamamos a nuestra función de refresco.
      handleRefresh();

    } catch (err) {
      console.error("Error al actualizar la organización:", err);
      alert("No se pudieron guardar los cambios. Inténtalo de nuevo.");
      setError(err);
    } finally {
      // 3. Haya éxito o error, cerramos el modal y limpiamos los estados
      setIsSaving(false);
      setShowEditModal(false);
      setEditingOrg(null);
    }
  };

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
            onRefresh={handleRefresh}  // Pasa la función de refresco como prop
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