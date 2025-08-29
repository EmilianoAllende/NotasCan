export const metricas = {
  total_organizaciones: 647,
  completadas: 425,
  en_revision: 89,
  pendientes: 133,
  automatizacion: 87,
  precision_ia: 94
};

export const estadosData = [
  { estado: 'Completadas', cantidad: 425, color: '#10b981' },
  { estado: 'En revisión', cantidad: 89, color: '#f59e0b' },
  { estado: 'Pendientes', cantidad: 133, color: '#ef4444' }
];

export const islasData = [
  { isla: 'Gran Canaria', organizaciones: 287 },
  { isla: 'Tenerife', organizaciones: 198 },
  { isla: 'Lanzarote', organizaciones: 76 },
  { isla: 'Fuerteventura', organizaciones: 45 },
  { isla: 'La Palma', organizaciones: 28 },
  { isla: 'La Gomera', organizaciones: 8 },
  { isla: 'El Hierro', organizaciones: 5 }
];

export const sectoresData = [
  { sector: 'Administración Pública', cantidad: 234 },
  { sector: 'Turismo', cantidad: 156 },
  { sector: 'Educación', cantidad: 89 },
  { sector: 'Tecnología', cantidad: 67 },
  { sector: 'Cultura', cantidad: 54 },
  { sector: 'Otros', cantidad: 47 }
];

export const organizaciones = [
  {
    id: 1,
    nombre: "Cabildo de La Palma",
    email: "prensa@cabildolapalma.es",
    contacto: {
      nombre: "María García López",
      cargo: "Jefa de Prensa",
      telefono: "+34 922 41 85 00"
    },
    municipio: "Santa Cruz de La Palma",
    isla: "La Palma",
    tipo: "Administración Pública",
    sector: "Energías Renovables",
    frecuencia: "Alta (12 envíos/mes)",
    estado: "completo",
    confianza_ia: 98,
    ultima_nota: "10-08-2025",
    ultimo_correo: "15-07-2025",
    notas_trimestre: 45,
    tendencia_temas: ["Energía renovable", "Volcán", "Turismo sostenible"]
  },
  {
    id: 2,
    nombre: "Ayuntamiento de Tinaja",
    email: "comunicacion@tinaja.es",
    contacto: {
      nombre: "Juan Pérez Martín",
      cargo: "Responsable Comunicación",
      telefono: "+34 928 59 62 12"
    },
    municipio: "Tinaja",
    isla: "Lanzarote",
    tipo: "Administración Pública",
    sector: "Comunicación institucional",
    frecuencia: "Media (6 envíos/mes)",
    estado: "revision",
    confianza_ia: 75,
    ultima_nota: "12-08-2025",
    ultimo_correo: "28-06-2025",
    notas_trimestre: 18,
    tendencia_temas: ["Turismo", "Cultura", "Premios"]
  },
  {
    id: 3,
    nombre: "Hotel Seaside Palm Beach",
    email: "marketing@seasidepalm.com",
    contacto: {
      nombre: "Ana Rodríguez Silva",
      cargo: "Directora Marketing",
      telefono: "+34 928 76 15 44"
    },
    municipio: "",
    isla: "",
    tipo: "Empresa",
    sector: "",
    frecuencia: "Baja (2 envíos/mes)",
    estado: "pendiente",
    confianza_ia: 0,
    ultima_nota: "14-08-2025",
    ultimo_correo: "No enviado",
    notas_trimestre: 6,
    tendencia_temas: []
  }
];

export const tiposCampana = {
  mmi_analytics: {
    nombre: "MMI Analytics",
    descripcion: "Análisis de impacto mediático personalizado",
    plantilla: "Detectamos que {ORGANIZACION} ha intensificado su comunicación sobre {TEMA_PRINCIPAL} este trimestre ({NUMERO_NOTAS} comunicaciones). ¿Os interesaría un análisis detallado del impacto mediático de vuestras iniciativas en {UBICACION}?"
  },
  roi: {
    nombre: "ROI",
    descripcion: "Retorno de inversión en comunicación",
    plantilla: "Hemos observado que {ORGANIZACION} mantiene una comunicación constante ({NUMERO_NOTAS} notas este trimestre). ¿Te gustaría conocer el ROI real de vuestras inversiones en comunicación y cómo optimizarlas?"
  },
  fundacion: {
    nombre: "Fundación",
    descripcion: "Servicios de la Fundación MMI",
    plantilla: "Vemos que {ORGANIZACION} trabaja activamente en {TEMA_PRINCIPAL}. Nuestra Fundación ofrece programas específicos para potenciar el impacto social de este tipo de iniciativas en {UBICACION}."
  }
};

export const campanasActivas = [
  {
    id: 1,
    organizacion: "Cabildo de La Palma",
    tipo: "MMI Analytics",
    fecha_envio: "15-07-2025",
    estado: "Enviado",
    abierto: true,
    respondido: false,
    asunto: "Análisis de impacto mediático - Energías renovables"
  },
  {
    id: 2,
    organizacion: "Universidad de Las Palmas",
    tipo: "ROI",
    fecha_envio: "05-08-2025",
    estado: "Enviado",
    abierto: true,
    respondido: true,
    asunto: "ROI de inversiones en comunicación académica"
  }
];