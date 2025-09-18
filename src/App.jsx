import React from 'react';
import { Users, Eye, Mail, Building, FilePenLine } from 'lucide-react';
import { tiposCampana, campanasActivas } from './data/data';
import apiClient from './api/apiClient';
import { getEntityType, ESTADOS_CLIENTE } from './utils/organizationUtils';
import Dashboard from './components/Dashboard';
import OrganizationList from './components/OrganizationList';
import OrganizationDetail from './components/OrganizationDetail';
import Campaigns from './components/Campaigns';
import ContactEditor from './components/ContactEditor';
import SendCampaignModal from './components/SendCampaignModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import AIindicator from './components/AIindicator';
import Notification from './components/Notification';

const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000;

//! RECORDAR MODULARIZAR CORRECTAMENTE, PRINCIPALMENTE LAS NUEVAS FUNCIONES.

const App = () => {
  const [activeView, setActiveView] = React.useState('listado');
  const [selectedOrg, setSelectedOrg] = React.useState(null);
  const [filterStatus, setFilterStatus] = React.useState('todos');
  const [filterType, setFilterType] = React.useState('todos');
  const [filterIsla, setFilterIsla] = React.useState('todos');
  const [filterSuscripcion, setFilterSuscripcion] = React.useState('todos');
  const [lastRefreshTs, setLastRefreshTs] = React.useState(() => {
    try {
      const cachedData = localStorage.getItem('organizaciones_cache');
      if (!cachedData) return null;
      const { timestamp } = JSON.parse(cachedData);
      const isExpired = new Date().getTime() - timestamp > CACHE_EXPIRATION_MS;
      return isExpired ? null : timestamp;
    } catch (e) {
      return null;
    }
  });
  const [showCampaignModal, setShowCampaignModal] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [organizaciones, setOrganizaciones] = React.useState(() => {
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

  const [isLoading, setIsLoading] = React.useState(organizaciones.length === 0);
  const [error, setError] = React.useState(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSendingCampaign, setIsSendingCampaign] = React.useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = React.useState('');
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [emailPreview, setEmailPreview] = React.useState(null); // { subject, body }
  const [notification, setNotification] = React.useState(null);

  // Métricas y datasets derivados de las organizaciones reales
  const computedMetricas = React.useMemo(() => {
    const total = organizaciones.length;
    const completadas = organizaciones.filter(o => o.estado_cliente === ESTADOS_CLIENTE.COMPLETADO).length;
    const en_revision = organizaciones.filter(o => o.estado_cliente === ESTADOS_CLIENTE.EN_REVISION).length;
    const pendientes = organizaciones.filter(o => o.estado_cliente === ESTADOS_CLIENTE.PENDIENTE).length;
    const automatizacion = total > 0 ? Math.round((completadas / total) * 100) : 0;
    // No tenemos una métrica de precisión de IA real aún. Dejamos 0 por ahora.
    const precision_ia = 0;
    return { total_organizaciones: total, completadas, en_revision, pendientes, automatizacion, precision_ia };
  }, [organizaciones]);

  const computedEstadosData = React.useMemo(() => ([
    { estado: 'Completadas', cantidad: computedMetricas.completadas, color: '#10b981' },
    { estado: 'En revisión', cantidad: computedMetricas.en_revision, color: '#f59e0b' },
    { estado: 'Pendientes', cantidad: computedMetricas.pendientes, color: '#ef4444' }
  ]), [computedMetricas]);

  const computedIslasData = React.useMemo(() => {
    const counts = new Map();
    for (const org of organizaciones) {
      const isla = (org.isla && org.isla !== 'indefinido') ? org.isla : null;
      if (!isla) continue;
      counts.set(isla, (counts.get(isla) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([isla, count]) => ({ isla, organizaciones: count }))
      .sort((a, b) => b.organizaciones - a.organizaciones);
  }, [organizaciones]);

  const computedSectoresData = React.useMemo(() => {
    const counts = new Map();
    for (const org of organizaciones) {
      const tipo = getEntityType(org) || 'Otros';
      counts.set(tipo, (counts.get(tipo) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([sector, cantidad]) => ({ sector, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);
  }, [organizaciones]);

// --- FUNCIÓN 1: Generar el borrador ---
  const handleGeneratePreview = async () => {
    if (!selectedOrg || !selectedCampaignType) {
      setNotification({
        type: 'warning',
        title: 'Selección Requerida',
        message: 'Por favor, selecciona un tipo de campaña antes de continuar.'
      });
      return;
    }

    setIsPreviewLoading(true);
    setEmailPreview(null);

    try {
      const response = await apiClient.generatePreview(selectedOrg, selectedCampaignType);
      setEmailPreview(response.data); // Guardamos el object { subject, body }
      setNotification({
        type: 'success',
        title: 'Borrador Generado',
        message: 'El borrador de la campaña ha sido generado exitosamente por la IA.'
      });
    } catch (err) {
      console.error("Error al generar el borrador:", err);
      setNotification({
        type: 'error',
        title: 'Error al Generar Borrador',
        message: 'No se pudo generar el borrador con la IA. Verifica la conexión con n8n.'
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

// --- FUNCIÓN 2: Confirmar y enviar ---
  const handleConfirmAndSend = async (finalContent) => {
// finalContent es un objeto { subject, body } que viene del modal
    setIsSendingCampaign(true);

    try {
      const payload = {
        organizationId: selectedOrg.id,
        subject: finalContent.subject,
        body: finalContent.body
      };
      
      const response = await apiClient.confirmAndSend(payload);
      let result = response.data;
      
// Log de la respuesta completa para diagnosticar errores.
      console.log("Respuesta completa de n8n:", response);
      console.log("Datos de respuesta (raw):", result);
      console.log("Tipo de datos:", typeof result);
      
      //! Si la respuesta es [] (string vacío), el workflow no llegó al nodo de respuesta.
      if (result === "" || result === null || result === undefined) {
        console.error("n8n devolvió respuesta vacía. El workflow no ejecutó ningún nodo 'Respond to Webhook'");
        setNotification({
          type: 'warning',
          title: 'Envío Cancelado',
          message: 'El envío fue cancelado porque el último correo se envió hace menos de 15 días. (El workflow de n8n necesita configurar el nodo de respuesta para este caso)'
        });
        return;
      }
      
// Si la respuesta es un string, intentar parsearla como JSON.
      if (typeof result === 'string') {
        try {
          result = JSON.parse(result);
          console.log("JSON parseado:", result);
        } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          setNotification({
            type: 'error',
            title: 'Error de Formato',
            message: 'La respuesta del webhook no es un JSON válido.'
          });
          return;
        }
      }
      
      console.log("Status recibido:", result?.status);
      
// Manejo de respuestas del webhook n8n
      if (result && result.status === 'success') {
        setNotification({
          type: 'success',
          title: 'Campaña Enviada',
          message: `La campaña para ${selectedOrg.nombre} se ha enviado correctamente.`
        });
        handleRefresh(); //? Refrescar datos.
      } else if (result && result.status === 'canceled') {
        setNotification({
          type: 'warning',
          title: 'Envío Cancelado',
          message: result.message || 'Envío de campaña cancelado. El tiempo desde el último correo enviado es inferior a 15 días.'
        });
// No hay refresco de datos en caso de cancelación.
      } else {
// Respuesta inesperada - Incluye más información para debug.
        console.warn("Respuesta inesperada del webhook:", result);
        setNotification({
          type: 'error',
          title: 'Respuesta Inesperada',
          message: `Estado recibido: "${result?.status || 'undefined'}". ${result?.message || 'El servidor devolvió un estado desconocido.'}`
        });
      }
      
    } catch (err) {
      console.error("Error al enviar la campaña:", err);
      
// Manejo de errores de red o del servidor
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.status === 'canceled') {
          setNotification({
            type: 'warning',
            title: 'Envío Cancelado',
            message: errorData.message || 'Envío cancelado por el servidor.'
          });
        } else {
          setNotification({
            type: 'error',
            title: 'Error del Servidor',
            message: errorData.message || 'Error desconocido del servidor.'
          });
        }
      } else {
        setNotification({
          type: 'error',
          title: 'Error de Conexión',
          message: 'No se pudo conectar con n8n. Verifica que esté ejecutándose en http://localhost:5678'
        });
      }
    } finally {
      setIsSendingCampaign(false);
      setShowCampaignModal(false);
      setEmailPreview(null); // Limpiamos el estado al cerrar
      setSelectedCampaignType('');
    }
  };

  React.useEffect(() => {
    if (organizaciones.length === 0) {
      setIsLoading(true);
      const fetchOrganizaciones = async () => {
        try {
          const response = await apiClient.getOrganizaciones();
          const cache = { data: response.data, timestamp: new Date().getTime() };
          localStorage.setItem('organizaciones_cache', JSON.stringify(cache));
          setOrganizaciones(response.data);
          setLastRefreshTs(cache.timestamp);
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
    setCurrentPage(1);
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
        return <Dashboard metricas={computedMetricas} estadosData={computedEstadosData} islasData={computedIslasData} sectoresData={computedSectoresData} />;
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
            filterIsla={filterIsla}
            setFilterIsla={setFilterIsla}
            filterSuscripcion={filterSuscripcion}
            setFilterSuscripcion={setFilterSuscripcion}
            lastRefreshTs={lastRefreshTs}
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
                <p className="text-gray-600 dark:text-gray-400">Transformando {computedMetricas.total_organizaciones} organizaciones en la base de datos comercial más precisa de Canarias</p>
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
        onClose={() => {
          setShowCampaignModal(false);
          setEmailPreview(null); // Limpiar al cerrar
        }}
        selectedOrg={selectedOrg}
        tiposCampana={tiposCampana}
        // Pasamos todo lo necesario para el nuevo flujo
        onGeneratePreview={handleGeneratePreview}
        onConfirmAndSend={handleConfirmAndSend}
        isPreviewLoading={isPreviewLoading}
        isSending={isSendingCampaign}
        emailPreview={emailPreview}
        selectedCampaignType={selectedCampaignType}
        setSelectedCampaignType={setSelectedCampaignType}
      />
      
      <AIindicator metricas={computedMetricas} />
      
      <Notification 
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default App;