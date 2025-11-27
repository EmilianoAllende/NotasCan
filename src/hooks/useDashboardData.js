import React from 'react';
// Asegúrate de que la ruta a organizationUtils sea correcta según tu estructura
import { getEntityType, ESTADOS_CLIENTE } from '../utils/organizationUtils';

export const useDashboardData = (organizaciones) => {
  const metricas = React.useMemo(() => {
    // Protección contra datos vacíos
    if (!organizaciones) return { pendientes: 0, automatizacion: 0, total: 0, en_revision: 0 };

    const total = organizaciones.length;

    // 1. Calcular Pendientes: Estado es PENDIENTE (0) o nulo/undefined
    const pendientes = organizaciones.filter(o => 
      o.estado_cliente === ESTADOS_CLIENTE.PENDIENTE || !o.estado_cliente
    ).length;

    // 2. Calcular En Revisión (Si usas ese estado)
    const en_revision = organizaciones.filter(o => 
      o.estado_cliente === ESTADOS_CLIENTE.REVISION
    ).length;

    // 3. Calcular Automatización:
    // Criterio: Tienen Email válido (el ID tiene '@') Y Suscripción Activa
    const orgsAutomatizables = organizaciones.filter(org => {
      const tieneEmail = org.id && org.id.includes('@');
      const estaActiva = org.suscripcion === 'activa';
      return tieneEmail && estaActiva;
    }).length;

    const automatizacion = total > 0 ? Math.round((orgsAutomatizables / total) * 100) : 0;
    const precision_ia = 85; // Placeholder o valor estático por ahora

    return { 
      total, 
      pendientes, 
      en_revision, 
      automatizacion, 
      precision_ia,
      orgsAutomatizables // Lo retornamos por si quieres usar el número exacto en gráficas
    };
  }, [organizaciones]);

  // Gráfica de Estados (Simplificada para el Dashboard)
  const estadosData = React.useMemo(() => ([
    { estado: 'Listas para IA', cantidad: metricas.orgsAutomatizables, color: '#10b981' }, // Verde
    { estado: 'En revisión', cantidad: metricas.en_revision, color: '#f59e0b' }, // Naranja
    { estado: 'Pendientes', cantidad: metricas.pendientes, color: '#ef4444' } // Rojo
  ]), [metricas]);

  // Gráfica de Islas
  const islasData = React.useMemo(() => {
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

  // Gráfica de Sectores
  const sectoresData = React.useMemo(() => {
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

  return { metricas, estadosData, islasData, sectoresData };
};