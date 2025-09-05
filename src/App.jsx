import React, { useState, useEffect } from 'react';
import { Users, Eye, Mail, Building, FilePenLine } from 'lucide-react';
import { metricas, tiposCampana, campanasActivas, estadosData, islasData, sectoresData } from './data/data';
import apiClient from './api/apiClient';
import Dashboard from './components/Dashboard';
import OrganizationList from './components/OrganizationList';
import OrganizationDetail from './components/OrganizationDetail';
import Campaigns from './components/Campaigns';
import ContactEditor from './components/ContactEditor';
import SendCampaignModal from './components/SendCampaignModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import AIindicator from './components/AIindicator';

// Tiempo de expiración en milisegundos (3 horas para pruebas)
const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000;

const App = () => {
  const [activeView, setActiveView] = useState('listado');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [organizaciones, setOrganizaciones] = useState(() => {
    try {
      const cachedData = localStorage.getItem('organizaciones_cache');
      if (!cachedData) return [];
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = new Date().getTime() - timestamp > CACHE_EXPIRATION_MS;
      return isExpired ? [] : data;
    } catch (error) {
      console.error("Error al leer desde localStorage", error);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(organizaciones.length === 0);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organizaciones.length === 0) {
      setIsLoading(true);
      const fetchOrganizaciones = async () => {
        try {
          const response = await apiClient.getOrganizaciones();
          const cache = { data: response.data, timestamp: new Date().getTime() };
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
  }, [organizaciones.length]);

  const handleRefresh = () => {
    localStorage.removeItem('organizaciones_cache');
    setOrganizaciones([]);
    setCurrentPage(1); // Reset pagination on refresh
  };

  const openEditor = (org) => {
    setSelectedOrg(org);
    setActiveView('editor');
  };

  const viewDetail = (org) => {
    setSelectedOrg(org);
    setActiveView('detalle');
  };

  const openCampaign = (org) => {
    setSelectedOrg(org);
    setShowCampaignModal(true);
  };

  const saveContact = async (updatedOrg) => {
    setIsSaving(true);
    setError(null);
    
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
      await apiClient.updateOrganization(orgToSend);
      handleRefresh();
      setActiveView('listado');
    } catch (err) {
      console.error("Error al actualizar la organización:", err);
      alert("No se pudieron guardar los cambios.");
      setError(err);
    } finally {
      setIsSaving(false);
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
            openEditModal={openEditor}
            viewDetail={viewDetail}
            openCampaign={openCampaign}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onRefresh={handleRefresh}
          />
        );
      case 'detalle':
        return <OrganizationDetail selectedOrg={selectedOrg} openEditModal={openEditor} setShowCampaignModal={setShowCampaignModal} />;
      
      case 'editor':
        return (
          <ContactEditor
            selectedOrg={selectedOrg}
            onSave={saveContact}
            onCancel={() => setActiveView('listado')}
            isSaving={isSaving}
          />
        );

      case 'campanas':
        return <Campaigns campanasActivas={campanasActivas} />;
      default:
        return (
            <div className="flex items-center justify-center h-full">
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>Por favor, selecciona una vista.</p>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen h-fit bg-gray-50 dark:bg-gray-900">
      <div className="bg-white border-b shadow-sm dark:bg-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NotasCan - Centro de enriquecimiento automático</h1>
                <p className="text-gray-600 dark:text-gray-400">Transformando {metricas.total_organizaciones} organizaciones en la base de datos comercial más precisa de Canarias</p>
            </div>
            <ThemeSwitcher />
        </div>
      </div>
      <div className="px-6 bg-white border-b dark:bg-gray-700">
        <div className="flex space-x-8">
          {[
            { id: 'listado', label: 'Gestión', icon: Users },
            { id: 'detalle', label: 'Detalle', icon: Eye },
            { id: 'editor', label: 'Editor', icon: FilePenLine }, 
            { id: 'campanas', label: 'Campañas', icon: Mail },
            { id: 'dashboard', label: 'Panel', icon: Building }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              disabled={(tab.id === 'detalle' || tab.id === 'editor') && !selectedOrg}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                activeView === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-300' : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
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
        {!isLoading && !error && <div className="h-auto">{renderView()}</div>}
      </div>

      <SendCampaignModal 
        show={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        selectedOrg={selectedOrg}
        tiposCampana={tiposCampana}
      />
      
      <AIindicator metricas={metricas} />
    </div>
  );
};

export default App;