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
import ConfirmModal from './components/ConfirmModal'; // --- ¡NUEVO! Modal de Confirmación ---
// -------------------------------------

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

  // --- AÑADIR ESTADO GLOBAL DE CAMPAÑA ---
const [selectedCampaignId, setSelectedCampaignId] = React.useState(null); 
// ----------------------------------------
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
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [emailPreview, setEmailPreview] = React.useState(null); // { subject, body }
  const [notification, setNotification] = React.useState(null);

  // --- ¡NUEVO! Estado para el modal de confirmación ---
  const [confirmProps, setConfirmProps] = React.useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  // ---------------------------------------------------

// Estados para modo call center
  const [isCallCenterMode, setIsCallCenterMode] = React.useState(false);
  const [currentQueueId, setCurrentQueueId] = React.useState(null);
  const [currentTask, setCurrentTask] = React.useState(null); // Contendrá { taskInfo, organization, email }
  const [isTaskLoading, setIsTaskLoading] = React.useState(false);

  // ESTADO NUEVO: Guarda temporalmente las organizaciones para la cola
  const [orgsToQueue, setOrgsToQueue] = React.useState(null); 

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

  // --- ¡NUEVO! Helper para cerrar el modal de confirmación ---
  const closeConfirm = () => {
    setConfirmProps({ show: false, title: '', message: '', onConfirm: () => {} });
  };

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
  const handleGeneratePreview = React.useCallback(async (orgToPreview, campaignIdToPreview) => {
    // Usar los argumentos si se pasan, o el estado si no
    const organization = orgToPreview || selectedOrg;
    const campaignId = campaignIdToPreview || selectedCampaignId;

  	if (!organization || !campaignId) {
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
      const template = campaignTemplates.find(t => t.id === campaignId);
      const prompt = buildPromptFromTemplate(template, organization);
      const payload = {
        data: {  // ← ENVOLVEMOS TODO EN "data"
          organization: organization,
          campaign: {
            id: template.id,
            title: template.title,
            description: template.description,
            mode: template.mode,
            prompt
          }
        }
  	  };
      // --- FIN DE CORRECCIÓN ---

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
  }, [selectedOrg, selectedCampaignId, campaignTemplates]); // Dependencias

// --- FUNCIÓN 2: Lógica REAL de envío (Nombre cambiado) ---
  const _executeConfirmAndSend = async (finalContent) => {
  	// finalContent es un objeto { subject, body } que viene del modal
  	setIsSendingCampaign(true);

  	try {
  	  const payload = {
  	 	organizationId: selectedOrg.id,
  	 	subject: finalContent.subject,
  	 	body: finalContent.body,
  	 	...(currentTask?.taskInfo && { taskInfo: currentTask.taskInfo }), // Añadir taskInfo si existe
  	 	campaignId: selectedCampaignId || undefined,
  	 	sentAt: new Date().toISOString(),
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

  // --- ¡NUEVO! Esta función "intercepta" la llamada de envío para mostrar la confirmación ---
  const handleConfirmAndSend = (finalContent) => {
    setConfirmProps({
      show: true,
      title: 'Confirmar Envío de Correo',
      message: `¿Estás seguro de que quieres enviar este correo a ${selectedOrg?.nombre}?`,
      confirmText: 'Enviar Correo',
      onConfirm: () => {
        _executeConfirmAndSend(finalContent);
        closeConfirm();
      }
    });
  };
  // -----------------------------------------------------------------------------------

  // --- NUEVA FUNCIÓN PARA MODO CALL CENTER ---
  const fetchNextTask = async (queueId, campaignId) => {
  	setIsTaskLoading(true);
    setShowCampaignModal(true); // Mantenemos el modal abierto
    setEmailPreview(null); // Limpiamos el preview anterior
    const CURRENT_USER_ID = 'user_emiliano';
  	try {
  	  if (!queueId) {
  	 	console.error("Intento de fetch sin un queueId activo.");
  	 	setNotification({ 
  	 	  type: 'error', 
  	 	  title: 'Error de Cola', 
  	 	  message: 'No hay una cola activa.' 
  	 	});
  	 	return;
  	  }

      // 1. Llamar a GetNextInQueue (sin prompt, solo para obtener la org)
      const taskResponse = await apiClient.getNextInQueue(queueId, CURRENT_USER_ID);
      
      if (taskResponse.data && taskResponse.data.organization) {
          const taskData = taskResponse.data;
          const organization = taskData.organization;

          // 2. Encontrar plantilla y construir prompt
          const template = campaignTemplates.find(t => t.id === selectedCampaignId); // Usar el ID del estado
          if (!template) throw new Error("Plantilla no encontrada.");
          
          const prompt = buildPromptFromTemplate(template, organization);

          // 3. Llamar a la API de IA (generatePreview)
          const previewPayload = { data: { organization, campaign: { ...template, prompt } } };
          const emailResponse = await apiClient.generatePreview(previewPayload);
          
          // 4. Combinar los datos y establecer el estado
          setCurrentTask(taskData);
          setSelectedOrg(organization);
          setEmailPreview(emailResponse.data); // <-- El borrador de la IA

  	  } else {
  	 	// No hay más tareas en la cola
  	 	setNotification({ type: 'success', title: 'Cola Finalizada', message: '¡Has procesado todas las organizaciones en la cola!' });
  	 	setIsCallCenterMode(false);
  	 	setShowCampaignModal(false);
  	  }
  	} catch (err) {
  	  console.error("Error fetching next task:", err); setNotification({ type: 'error', title: 'Error de Red', message: 'No se pudo cargar la siguiente tarea de la cola.' });
  	  setIsCallCenterMode(false);
  	} finally {
  	  setIsTaskLoading(false);
  	}
  };

  // --- Lógica REAL de inicio (Nombre cambiado) ---
  const _executeStartCallCenterMode = async (selectedOrgs) => { 
  	setIsTaskLoading(true);
  	try {
  	// 1. Extraer los IDs de las organizaciones seleccionadas
  	  const orgIds = selectedOrgs.map(org => org.id); 

  	// 2. Crear la cola dinámica en el backend
  	  const response = await apiClient.createDynamicQueue(orgIds);
  	  const { queueId } = response.data;

  	  if (queueId) {
  	// 3. Guardar el ID de la cola y activar el modo
  	 	setCurrentQueueId(queueId);
  	 	setIsCallCenterMode(true);
        // selectedCampaignId ya está en el estado, no necesitamos pasarlo como parámetro
  	 	
        // 3. Buscar la primera tarea (ahora pasamos el campaignId)
  	 	await fetchNextTask(queueId, selectedCampaignId); 
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

  // --- ¡NUEVO! Esta función "intercepta" la llamada para mostrar la confirmación ---
  const startCallCenterMode = (selectedOrgs) => {
    // --- VALIDACIÓN DE CAMPAÑA ---
    if (!selectedCampaignId) {
      setNotification({
        type: 'warning',
        title: 'Campaña no seleccionada',
        message: 'Por favor, selecciona una campaña del listado antes de iniciar el Modo Call Center.'
      });
      return;
    }
    // ----------------------------

    if (!selectedOrgs || selectedOrgs.length < 2) {
      setNotification({
        type: 'warning',
        title: 'Selección Insuficiente',
        message: 'Debes seleccionar al menos 2 organizaciones para iniciar el modo call center.'
      });
      return;
    }

    setConfirmProps({
      show: true,
      title: 'Iniciar Modo Call Center',
      message: `¿Estás seguro de que quieres generar una cola con ${selectedOrgs.length} organizaciones?`,
      confirmText: 'Generar Cola',
      onConfirm: () => {
        _executeStartCallCenterMode(selectedOrgs);
        closeConfirm();
      }
    });
  };
  // ------------------------------------------------------------------------------

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

  const handleOpenCampaignModal = React.useCallback((org) => {
  	setSelectedOrg(org);
  	setEmailPreview(null); 
  	// No limpiamos el selectedCampaignId global
  	setCurrentTask(null); 
  	setIsCallCenterMode(false);
  	setShowCampaignModal(true);

    // Si ya hay una campaña seleccionada globalmente, generar el borrador
    if (selectedCampaignId) {
        handleGeneratePreview(org, selectedCampaignId);
    }
  }, [selectedCampaignId]); // <-- Añadir dependencia
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
  	 	 	openCampaign={handleOpenCampaignModal}
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
            // --- NUEVAS PROPS ---
            campaignTemplates={campaignTemplates}
            selectedCampaignId={selectedCampaignId}
            setSelectedCampaignId={setSelectedCampaignId}
  	 	  />
  	 	);
  	  case 'detalle':
  	 	return <OrganizationDetail 
            selectedOrg={selectedOrg} 
            openEditModal={openEditor} 
            setShowCampaignModal={setShowCampaignModal} 
            // --- NUEVAS PROPS ---
            selectedCampaignId={selectedCampaignId}
            onSelectCampaignRequired={() => {
                setNotification({
                    type: 'warning',
                    title: 'Campaña Requerida',
                    message: 'Por favor, selecciona una campaña en el listado antes de enviar un email.'
                });
            }}
        />;
  	 	
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
  	  
  	  {/* --- Barra Lateral de Navegación --- */}
  	  <Sidebar 
  	 	activeView={activeView}
  	 	setActiveView={setActiveView}
  	 	selectedOrg={selectedOrg}
  	  />

  	  {/* --- Contenido Principal --- */}
  	  <main className="flex-1 flex flex-col overflow-y-auto">
  	 	{/* Contenedor del contenido con padding */}
  	 	<div className="p-4 sm:p-6 lg:p-8 flex-1">
  	 	  {isLoading && <p className="text-center text-slate-500 dark:text-slate-400">Cargando organizaciones...</p>}
  	 	  {error && <p className="text-center text-red-500">Error al cargar los datos: {error.message}</p>}
  	 	  {!isLoading && !error && <div className="h-auto">{renderView()}</div>}
  	 	</div>
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
  	 	setSelectedCampaignId={setSelectedCampaignId} // <-- Pasar el setter
  	 	isTaskLoading={isTaskLoading}
        isCallCenterMode={isCallCenterMode} // <-- Pasar el estado
        onExecuteCallCenterStart={_executeStartCallCenterMode} // <-- Pasar la función
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
      />

  	  <AIindicator metricas={metricas} procesando={organizaciones.length} />
  	  
  	  <Notification 
  	 	notification={notification}
  	 	onClose={() => setNotification(null)}
  	  />
  	</div>
  );
  // --- FIN DE NUEVO DISEÑO ---
};

export default App;
