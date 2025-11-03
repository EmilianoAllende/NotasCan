import React from 'react';
import { Users, Eye, Mail, Building, FilePenLine } from 'lucide-react';
import { tiposCampana, campanasActivas } from './data/data';
import apiClient from './api/apiClient';
import { useDashboardData } from './hooks/useDashboardData';
import Dashboard from './components/Dashboard';
import OrganizationList from './components/OrganizationList';
import OrganizationDetail from './components/OrganizationDetail';
import Campaigns from './components/Campaigns';
import ContactEditor from './components/ContactEditor';
import SendCampaignModal from './components/SendCampaignModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import AIindicator from './components/AIindicator';
import Notification from './components/Notification';
import { seedIfEmpty, saveTemplates } from './utils/campaignsStore';

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
  const [selectedCampaignId, setSelectedCampaignId] = React.useState('');
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [emailPreview, setEmailPreview] = React.useState(null); // { subject, body }
  const [notification, setNotification] = React.useState(null);

// Estados para modo call center
  const [isCallCenterMode, setIsCallCenterMode] = React.useState(false);
  const [currentQueueId, setCurrentQueueId] = React.useState(null);
  const [currentTask, setCurrentTask] = React.useState(null); // Contendrá { taskInfo, organization, email }
  const [isTaskLoading, setIsTaskLoading] = React.useState(false);

  // Plantilla por defecto para prompts (modo RAW), basada en el ejemplo provisto
  const DEFAULT_PROMPT = `Tu tarea es generar un correo electrónico de tipo "{{ $('Data Extractor').item.json.campaignType }}" para la organización "{{ $('Data Extractor').item.json.organizacion }}".
**Datos del destinatario:**
- Persona de contacto: {{ $('Data Extractor').item.json.persona_contacto }}
- Si el elemento anterior no existe o es "indefinido" (o similar), usa en su lugar "{{ $('Data Extractor').item.json.persona }}"
- Industria: {{ $('Data Extractor').item.json.industria }}
- Metadata: : {{ $('Data Extractor').item.json.industria }}
**Instrucciones:**
- El tono debe ser profesional pero cercano.
- El asunto (subject) debe ser corto y atractivo.
- El cuerpo (body) debe ser conciso.
- Ten en cuenta metadata como "actividad principal" y "intereses".
- Debes basarte en los siguientes ejemplos sobre cómo redactar (y cómo no redactar) el correo.
---
**EJEMPLOS DE CÓMO SÍ REDACTAR (BUENOS):**
**Ejemplo 1:** {
  "subject": "Potenciando a [Nombre de la Empresa]",
  "body": "Hola [Nombre de Contacto], nos comunicamos con usted porque veo que [Nombre de la Empresa] es un referente en el sector de [Industria]. Creo que nuestra solución podría ayudarles a optimizar sus procesos. ¿Te interesaría conversar 15 minutos la próxima semana?"
}
**Ejemplo 2:** {
  "subject": "Una idea para [Nombre de la Empresa]",
  "body": "Estimado/a [Nombre de Contacto], Nuestro equipo ha desarrollado una herramienta que está ayudando a empresas de [Industria] a mejorar su rendimiento. Me encantaría mostrarte cómo podría aplicarse en [Nombre de la Empresa]. Saludos."
}
**Ejemplo 3:** {
  "subject": "Colaboración con [Nombre de la Empresa]",
  "body": "Hola [Nombre de Contacto], espero que se encuentre muy bien. Vemos el gran trabajo que hacen en [Industria] y queríamos proponer una sinergia. ¿Tendrías un momento para explorar esta posibilidad?"
}
---
**EJEMPLOS DE CÓMO NO REDACTAR (MALOS):**
**Ejemplo 1 (Demasiado genérico):** {
  "subject": "Oportunidad de negocio",
  "body": "Estimado cliente, tenemos un producto que le puede interesar. Contáctenos."
}
**Ejemplo 2 (Muy informal y vago):** {
  "subject": "Hola!",
  "body": "Qué tal? Vi tu empresa y pensé que podríamos hacer algo juntos. Avísame."
}
**Ejemplo 3 (Exagerado y poco profesional):** {
  "subject": "¡¡LA MEJOR OFERTA DE SU VIDA!!",
  "body": "No creerá lo que tenemos para usted. ¡Es una revolución! ¡Llame ya!"
}`;

  // Inicialización de plantillas de campaña (templates) en localStorage a partir de tiposCampana
  const [campaignTemplates, setCampaignTemplates] = React.useState(() => {
    const defaults = Object.entries(tiposCampana).map(([id, t]) => ({
      id,
      title: t.nombre,
      description: t.descripcion,
      mode: 'builder',
      rawPrompt: DEFAULT_PROMPT,
      builder: { campaignType: id, instructions: '', examplesGood: '', examplesBad: '', useMetadata: true }
    }));
    return seedIfEmpty(defaults);
  });

  // Métricas y datasets mediante hook reutilizable
  const { metricas, estadosData, islasData, sectoresData } = useDashboardData(organizaciones);

  const handleTemplatesChange = (next) => {
    setCampaignTemplates(next);
    saveTemplates(next);
  };

  const buildPromptFromTemplate = (template, org) => {
    if (!template) return DEFAULT_PROMPT;
    if (template.mode === 'raw' && template.rawPrompt) return template.rawPrompt;
    // Constructor simple: incluimos título/descripcion y pistas básicas
    const persona = org?.nombres_org || org?.nombre || '[Contacto]';
    const industria = org?.sector || org?.industria || '[Industria]';
    const orgName = org?.organizacion || org?.nombre || '[Organización]';
    const header = `Genera un correo de tipo "${template?.builder?.campaignType || template.id}" para la organización "${orgName}".`;
    const meta = `Datos del destinatario: contacto: ${persona}; industria: ${industria}.`;
    const baseInstr = `El tono debe ser profesional pero cercano. El asunto corto y atractivo. El cuerpo conciso.`;
    const extra = template?.builder?.instructions ? `Instrucciones extra: ${template.builder.instructions}` : '';
    return [header, `Título de campaña: ${template.title}`, `Descripción: ${template.description}`, meta, baseInstr, extra].filter(Boolean).join('\n');
  };

// --- FUNCIÓN 1: Generar el borrador ---
  const handleGeneratePreview = async () => {
    if (!selectedOrg || !selectedCampaignId) {
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
      const template = campaignTemplates.find(t => t.id === selectedCampaignId);
      const prompt = buildPromptFromTemplate(template, selectedOrg);
      const payload = {
        data: {  // ← ENVOLVEMOS TODO EN "data"
          organization: selectedOrg,
          campaign: {
            id: template.id,
            title: template.title,
            description: template.description,
            mode: template.mode,
            prompt
          }
        }
      };
      const response = await apiClient.generatePreview(payload);
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
        body: finalContent.body,
        ...(currentTask?.taskInfo && { taskInfo: currentTask.taskInfo }), // Añadir taskInfo si existe
        // Opcional: id de la plantilla usada para campañas_log en backend
        campaignId: selectedCampaignId || undefined,
        // Opcional: fecha de envío (ISO) para facilitar cálculo de hace_dias en backend
        sentAt: new Date().toISOString(),
        // Opcional: solicitar que el backend actualice el campo raíz 'hace_dias' (por compatibilidad con vistas existentes)
        updateHaceDias: true
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

        // ¡AQUÍ ESTÁ EL LOOP!
        if (isCallCenterMode) {
            // Si estamos en modo call center, buscamos la siguiente tarea en lugar de cerrar.
            fetchNextTask();
        } else {
            // Comportamiento normal
            handleRefresh();
            setShowCampaignModal(false);
            setEmailPreview(null);
            setSelectedCampaignId('');
        }
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
      // En modo call center, el modal solo se cierra si no hay más tareas o hay un error.
      if (!isCallCenterMode) {
        setShowCampaignModal(false);
        setEmailPreview(null);
        setSelectedCampaignId('');
      }
    }
  };

  // --- NUEVA FUNCIÓN PARA MODO CALL CENTER ---
  const fetchNextTask = async () => {
    setIsTaskLoading(true);
    setShowCampaignModal(true); // Mantenemos el modal abierto
    setEmailPreview(null); // Limpiamos el preview anterior
    try {
// Validar que tengamos un queueId activo
      if (!currentQueueId) {
        console.error("Intento de fetch sin un queueId activo.");
        setNotification({ 
          type: 'error', 
          title: 'Error de Cola', 
          message: 'No hay una cola activa.' 
        });
        setIsCallCenterMode(false);
        setShowCampaignModal(false);
        return;
      }
      const response = await apiClient.getNextInQueue(currentQueueId, 'user_emiliano');
      if (response.data && response.data.organization) {
        setCurrentTask(response.data);
        setSelectedOrg(response.data.organization); // Actualizamos la org seleccionada
        setCurrentPage(1); // Resetear a la primera página para mejor UX
        setEmailPreview(response.data.email); // Ponemos el nuevo borrador
      } else {
        // No hay más tareas en la cola
        setNotification({ type: 'success', title: 'Cola Finalizada', message: '¡Has procesado todas las organizaciones en la cola!' });
        setIsCallCenterMode(false);
        setShowCampaignModal(false);
      }
    } catch (err) {
      console.error("Error fetching next task:", err);
      setNotification({ type: 'error', title: 'Error de Red', message: 'No se pudo cargar la siguiente tarea de la cola.' });
      setIsCallCenterMode(false);
    } finally {
      setIsTaskLoading(false);
    }
  };

  const startCallCenterMode = async (filteredOrgs) => {
// Validar que haya organizaciones
    if (!filteredOrgs || filteredOrgs.length === 0) {
      setNotification({ 
        type: 'warning', 
        title: 'Lista Vacía', 
        message: 'No hay organizaciones en la lista filtrada para iniciar.' 
      });
      return;
    }

    setIsTaskLoading(true);
    try {
// 1. Extraer los IDs de las organizaciones filtradas
      const orgIds = filteredOrgs.map(org => org.id);

// 2. Crear la cola dinámica en el backend
      const response = await apiClient.createDynamicQueue(orgIds);
      const { queueId } = response.data;

      if (queueId) {
// 3. Guardar el ID de la cola y activar el modo
        setCurrentQueueId(queueId);
        setIsCallCenterMode(true);

// 4. Buscar la primera tarea de la nueva cola
        await fetchNextTask(); 
      } else {
        throw new Error("La API no devolvió un queueId.");
      }

    } catch (err) {
      console.error("Error al iniciar el modo call center:", err);
      setNotification({ 
        type: 'error', 
        title: 'Error al Crear Cola', 
        message: 'No se pudo generar la cola de envíos.' 
      });
    } finally {
      setIsTaskLoading(false);
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
    setLastRefreshTs(null);
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
            filterIsla={filterIsla}
            setFilterIsla={setFilterIsla}
            filterSuscripcion={filterSuscripcion}
            setFilterSuscripcion={setFilterSuscripcion}
            lastRefreshTs={lastRefreshTs}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onRefresh={handleRefresh}
            startCallCenterMode={startCallCenterMode}
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
        return (
          <Campaigns 
            campanasActivas={campanasActivas} 
            organizaciones={organizaciones}
            campaignTemplates={campaignTemplates}
            onTemplatesChange={handleTemplatesChange}
            onSelectTemplateForSend={(id) => setSelectedCampaignId(id)}
          />
        );
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
        onClose={() => {
          setShowCampaignModal(false);
          setEmailPreview(null); // Limpiar al cerrar
        }}
        selectedOrg={selectedOrg}
        campaignTemplates={campaignTemplates}
        // Pasamos todo lo necesario para el nuevo flujo
        onGeneratePreview={handleGeneratePreview}
        onConfirmAndSend={handleConfirmAndSend}
        isPreviewLoading={isPreviewLoading}
        isSending={isSendingCampaign}
        emailPreview={emailPreview}
        selectedCampaignId={selectedCampaignId}
        setSelectedCampaignId={setSelectedCampaignId}
        isTaskLoading={isTaskLoading}
      />
      
      <AIindicator metricas={metricas} procesando={organizaciones.length} />
      
      <Notification 
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default App;