import React from 'react';
// Los iconos de navegación ahora se usan en Sidebar.jsx
// import { Users, Eye, Mail, Building, FilePenLine } from 'lucide-react';
import { tiposCampana, campanasActivas } from './data/data';
import apiClient from './api/apiClient';
import { useDashboardData } from './hooks/useDashboardData';
import Dashboard from './components/Dashboard';
import OrganizationList from './components/OrganizationList';
import OrganizationDetail from './components/OrganizationDetail';
import Campaigns from './components/Campaigns';
import ContactEditor from './components/ContactEditor';
import SendCampaignModal from './components/SendCampaignModal';
import AIindicator from './components/AIindicator';
import Notification from './components/Notification';
import { seedIfEmpty, saveTemplates } from './utils/campaignsStore';

// --- NUEVOS COMPONENTES MODULARES ---
import Sidebar from './components/Sidebar'; 
import ConfirmModal from './components/ConfirmModal';
import LoginScreen from './components/LoginScreen'; // --- ¡NUEVO! Componente de Login ---
import UserAdmin from './components/UserAdmin'; // --- ¡NUEVO! Vista de Admin ---
// -------------------------------------

const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000;

//! RECORDAR MODULARIZAR CORRECTAMENTE, PRINCIPALMENTE LAS NUEVAS FUNCIONES.

const App = () => {
  // --- ¡ESTADO DE AUTENTICACIÓN MEJORADO! ---
  // Ahora guarda el objeto de usuario completo
  const [currentUser, setCurrentUser] = React.useState(() => {
    try {
      const item = localStorage.getItem('currentUser');
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error("Error al parsear currentUser de localStorage", e);
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => !!currentUser);
  // ------------------------------------

  // --- ¡NUEVO! Estado para la barra lateral ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  // ----------------------------------------

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

  // --- ¡NUEVO! Estado para el modal de confirmación ---
  const [confirmProps, setConfirmProps] = React.useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info', // Añadimos 'type' al estado inicial
  });
  // ---------------------------------------------------

// Estados para modo call center
  const [isCallCenterMode, setIsCallCenterMode] = React.useState(false);
  const [currentQueueId, setCurrentQueueId] = React.useState(null);
  const [currentTask, setCurrentTask] = React.useState(null); // Contendrá { taskInfo, organization, email }
  const [isTaskLoading, setIsTaskLoading] = React.useState(false);

  // Plantilla por defecto para prompts (modo RAW), basada en el ejemplo provisto
  const DEFAULT_PROMPT = `Tu tarea es... (código de prompt omitido por brevedad)`;

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

  // --- ¡NUEVO! Helper para cerrar el modal de confirmación ---
  const closeConfirm = () => {
    setConfirmProps({ show: false, title: '', message: '', onConfirm: () => {}, type: 'info' });
  };

  // --- ¡NUEVO! Función de Logout ---
  const handleLogout = () => {
    localStorage.removeItem('currentUser'); // Borra el objeto de usuario
    setCurrentUser(null);
    setIsAuthenticated(false); // Cambia el estado para mostrar el Login
    setActiveView('listado'); // --- ¡CAMBIO AQUÍ! Resetea la vista
  };
  
  // --- ¡NUEVO! Función de Login ---
  const handleLoginSuccess = (userData) => {
    // userData es el objeto { status: 'success', user: { usuario: 'alex', rol: 'admin', token: '...' } }
    localStorage.setItem('currentUser', JSON.stringify(userData.user)); // Guarda el objeto de usuario
    setCurrentUser(userData.user);
    setIsAuthenticated(true);
    setActiveView('listado'); // --- ¡CAMBIO AQUÍ! Resetea la vista
  };

  const handleTemplatesChange = (next) => {
  	setCampaignTemplates(next);
  	saveTemplates(next);
  };

  const buildPromptFromTemplate = (template, org) => {
  	if (!template) return DEFAULT_PROMPT;
  	if (template.mode === 'raw' && template.rawPrompt) return template.rawPrompt;
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
  	  setNotification({ type: 'warning', title: 'Selección Requerida', message: 'Por favor, selecciona un tipo de campaña antes de continuar.' });
  	  return;
  	}
  	setIsPreviewLoading(true);
  	setEmailPreview(null);
  	try {
  	  const template = campaignTemplates.find(t => t.id === selectedCampaignId);
  	  const prompt = buildPromptFromTemplate(template, selectedOrg);
  	  const payload = {
  	 	data: {
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
  	  setEmailPreview(response.data); 
  	  setNotification({ type: 'success', title: 'Borrador Generado', message: 'El borrador de la campaña ha sido generado exitosamente por la IA.' });
  	} catch (err) {
  	  console.error("Error al generar el borrador:", err);
  	  setNotification({ type: 'error', title: 'Error al Generar Borrador', message: 'No se pudo generar el borrador con la IA. Verifica la conexión con n8n.' });
  	} finally {
  	  setIsPreviewLoading(false);
  	}
  };

// --- FUNCIÓN 2: Lógica REAL de envío (Nombre cambiado) ---
  const _executeConfirmAndSend = async (finalContent) => {
  	setIsSendingCampaign(true);
  	try {
  	  const payload = {
  	 	organizationId: selectedOrg.id,
  	 	subject: finalContent.subject,
  	 	body: finalContent.body,
  	 	...(currentTask?.taskInfo && { taskInfo: currentTask.taskInfo }),
  	 	campaignId: selectedCampaignId || undefined,
  	 	sentAt: new Date().toISOString(),
  	 	updateHaceDias: true
  	  };
  	  
  	  const response = await apiClient.confirmAndSend(payload);
  	  let result = response.data;
  	  
  	  if (result === "" || result === null || result === undefined) {
  	 	console.error("n8n devolvió respuesta vacía.");
  	 	setNotification({ type: 'warning', title: 'Envío Cancelado', message: 'El envío fue cancelado (respuesta vacía).' });
  	 	return;
  	  }
  	  
  	  if (typeof result === 'string') {
  	 	try { result = JSON.parse(result); } catch (parseError) {
  	 	  console.error("Error al parsear JSON:", parseError);
  	 	  setNotification({ type: 'error', title: 'Error de Formato', message: 'La respuesta del webhook no es un JSON válido.' });
  	 	  return;
  	 	}
  	  }
  	  
  	  if (result && result.status === 'success') {
  	 	setNotification({ type: 'success', title: 'Campaña Enviada', message: `La campaña para ${selectedOrg.nombre} se ha enviado correctamente.` });
  	 	if (isCallCenterMode) {
  	 	  fetchNextTask();
  	 	} else {
  	 	  handleRefresh();
  	 	  setShowCampaignModal(false);
  	 	  setEmailPreview(null);
  	 	  setSelectedCampaignId('');
  	 	}
  	  } else if (result && result.status === 'canceled') {
  	 	setNotification({ type: 'warning', title: 'Envío Cancelado', message: result.message || 'Envío de campaña cancelado. El tiempo desde el último correo enviado es inferior a 15 días.' });
  	  } else {
  	 	console.warn("Respuesta inesperada del webhook:", result);
  	 	setNotification({ type: 'error', title: 'Respuesta Inesperada', message: `Estado recibido: "${result?.status || 'undefined'}". ${result?.message || 'El servidor devolvió un estado desconocido.'}` });
  	  }
  	  
  	} catch (err) {
  	  console.error("Error al enviar la campaña:", err);
  	  if (err.response && err.response.data) {
  	 	const errorData = err.response.data;
  	 	if (errorData.status === 'canceled') {
  	 	  setNotification({ type: 'warning', title: 'Envío Cancelado', message: errorData.message || 'Envío cancelado por el servidor.' });
  	 	} else {
  	 	  setNotification({ type: 'error', title: 'Error del Servidor', message: errorData.message || 'Error desconocido del servidor.' });
  	 	}
  	  } else {
  	 	setNotification({ type: 'error', title: 'Error de Conexión', message: 'No se pudo conectar con n8n. Verifica que esté ejecutándose en http://localhost:5678' });
  	  }
  	} finally {
  	  setIsSendingCampaign(false);
  	  if (!isCallCenterMode) {
  	 	setShowCampaignModal(false);
  	 	setEmailPreview(null);
  	 	setSelectedCampaignId('');
  	  }
  	}
  };

  // --- Esta función "intercepta" la llamada de envío para mostrar la confirmación ---
  const handleConfirmAndSend = (finalContent) => {
    setConfirmProps({
      show: true,
      title: 'Confirmar Envío de Correo',
      message: `¿Estás seguro de que quieres enviar este correo a ${selectedOrg?.nombre}?`,
      confirmText: 'Enviar Correo',
      type: 'info', // Tipo 'info' para botón azul
      onConfirm: () => {
        _executeConfirmAndSend(finalContent);
        closeConfirm();
      }
    });
  };
  // -----------------------------------------------------------------------------------

  // --- NUEVA FUNCIÓN PARA MODO CALL CENTER ---
  const fetchNextTask = async () => {
  	setIsTaskLoading(true);
  	setShowCampaignModal(true); 
  	setEmailPreview(null); 
  	try {
  	  if (!currentQueueId) {
  	 	console.error("Intento de fetch sin un queueId activo.");
  	 	setNotification({ type: 'error', title: 'Error de Cola', message: 'No hay una cola activa.' });
  	 	setIsCallCenterMode(false);
  	 	setShowCampaignModal(false);
  	 	return;
  	  }
  	  const response = await apiClient.getNextInQueue(currentQueueId, 'user_emiliano');
  	  if (response.data && response.data.organization) {
  	 	setCurrentTask(response.data);
  	 	setSelectedOrg(response.data.organization); 
  	 	setCurrentPage(1); 
  	 	setEmailPreview(response.data.email); 
  	  } else {
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

  // --- Lógica REAL de inicio (Nombre cambiado) ---
  const _executeStartCallCenterMode = async (selectedOrgs) => { 
  	setIsTaskLoading(true);
  	try {
  	  const orgIds = selectedOrgs.map(org => org.id); 
  	  const response = await apiClient.createDynamicQueue(orgIds);
  	  const { queueId } = response.data;
  	  if (queueId) {
  	 	setCurrentQueueId(queueId);
  	 	setIsCallCenterMode(true);
  	 	await fetchNextTask(); 
  	  } else {
  	 	throw new Error("La API no devolvió un queueId.");
  	  }
  	} catch (err) {
  	  console.error("Error al iniciar el modo call center:", err);
  	  setNotification({ type: 'error', title: 'Error al Crear Cola', message: 'No se pudo generar la cola de envíos.' });
  	} finally {
  	  setIsTaskLoading(false);
  	}
  };

  // --- Esta función "intercepta" la llamada para mostrar la confirmación ---
  const startCallCenterMode = (selectedOrgs) => {
    if (!selectedOrgs || selectedOrgs.length < 2) {
      setNotification({ type: 'warning', title: 'Selección Insuficiente', message: 'Debes seleccionar al menos 2 organizaciones para iniciar el modo call center.' });
      return;
    }
    setConfirmProps({
      show: true,
      title: 'Iniciar Modo Call Center',
      message: `¿Estás seguro de que quieres generar una cola con ${selectedOrgs.length} organizaciones?`,
      confirmText: 'Generar Cola',
      type: 'info', // Tipo 'info' para botón azul
      onConfirm: () => {
        _executeStartCallCenterMode(selectedOrgs);
        closeConfirm();
      }
    });
  };
  // ------------------------------------------------------------------------------

  React.useEffect(() => {
  	if (organizaciones.length === 0 && isAuthenticated) { // <-- Solo carga si está autenticado
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
  }, [organizaciones.length, isAuthenticated]); // <-- Añadido isAuthenticated como dependencia

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
  	 	 	startCallCenterMode={startCallCenterMode} // Prop se mantiene igual
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
            // --- ¡NUEVO! Pasamos los controladores del modal de confirmación ---
            setConfirmProps={setConfirmProps}
            closeConfirm={closeConfirm}
            // -----------------------------------------------------------------
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
      // --- ¡NUEVO! Vista de Admin ---
      case 'admin':
        return (
          <UserAdmin 
            currentUser={currentUser}
            setNotification={setNotification}
          />
        );
  	  default:
  	 	return (
  	 	  <div className="flex items-center justify-center h-full">
  	 	 	<div className="p-8 text-center text-slate-500 dark:text-slate-400">
 	 	 	  <p>Por favor, selecciona una vista.</p>
	 	 	</div>
  	 	  </div>
  	 	);
  	}
  };
  
  // --- NUEVO DISEÑO DE LAYOUT ---
  return (
  	<div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200">
  	  
      {/* --- ¡NUEVO! Renderizado condicional del Login --- */}
      {!isAuthenticated && (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} // <-- Pasa la nueva función
        />
      )}

      {/* --- Renderizado condicional de la App Principal --- */}
      {isAuthenticated && (
        <>
 	 	  {/* --- Barra Lateral de Navegación --- */}
  	 	  <Sidebar 
  	 	 	activeView={activeView}
  	 	 	setActiveView={setActiveView}
  	 	 	selectedOrg={selectedOrg}
            onLogout={handleLogout} // <-- Pasa la nueva función de logout
            currentUser={currentUser} // <-- Pasa el usuario para mostrar/ocultar "Admin"
            // --- ¡NUEVO! Props para colapsar ---
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(prev => !prev)}
  	 	  />

  	 	  {/* --- Contenido Principal --- */}
          {/* --- ¡CAMBIOS DE ESTILO! Padding movido aquí y scrollbar --- */}
  	 	  <main className="flex-1 flex flex-col overflow-y-auto">
  	 	 	{isLoading && <p className="text-center text-slate-500 dark:text-slate-400 p-8">Cargando organizaciones...</p>}
  	 	 	{error && <p className="text-center text-red-500 p-8">Error al cargar los datos: {error.message}</p>}
  	 	 	{!isLoading && !error && <div className="h-auto">{renderView()}</div>}
  	 	  </main>

  	 	  <SendCampaignModal 
  	 	 	show={showCampaignModal}
  	 	 	onClose={() => {
 	 	  setShowCampaignModal(false);
 	 	 	  setEmailPreview(null); // Limpiar al cerrar
  	 	 	}}
  	 	 	selectedOrg={selectedOrg}
  	 	 	campaignTemplates={campaignTemplates}
  	 	 	onGeneratePreview={handleGeneratePreview}
  	 	 	onConfirmAndSend={handleConfirmAndSend} // Prop se mantiene igual
  	 	 	isPreviewLoading={isPreviewLoading}
  	 	 	isSending={isSendingCampaign}
  	 	 	emailPreview={emailPreview}
  	 	 	selectedCampaignId={selectedCampaignId}
  	 	 	setSelectedCampaignId={setSelectedCampaignId}
  	 	 	isTaskLoading={isTaskLoading}
            // --- ¡NUEVO! Pasamos los controladores del modal de confirmación ---
            setConfirmProps={setConfirmProps}
            closeConfirm={closeConfirm}
            // -----------------------------------------------------------------
  	 	  />
  	 	  
          {/* --- ¡NUEVO! Renderiza el modal de confirmación --- */}
          <ConfirmModal 
            show={confirmProps.show}
            title={confirmProps.title}
            message={confirmProps.message}
            onConfirm={confirmProps.onConfirm}
            onCancel={closeConfirm}
            confirmText={confirmProps.confirmText}
            type={confirmProps.type} // <-- ¡LA CORRECCIÓN ESTÁ AQUÍ!
          />

 	 	  <AIindicator metricas={metricas} procesando={organizaciones.length} />
  	 	  
  	 	  <Notification 
  	 	 	notification={notification}
  	 	 	onClose={() => setNotification(null)}
  	 	  />
        </>
      )}
  	</div>
  );
  // --- FIN DE NUEVO DISEÑO ---
};

export default App;

