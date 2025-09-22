import React from 'react';
import { getEntityType, ESTADOS_CLIENTE } from '../utils/organizationUtils';

export const useDashboardData = (organizaciones) => {
  const metricas = React.useMemo(() => {
    const total = organizaciones.length;
    const completadas = organizaciones.filter(o => o.estado_cliente === ESTADOS_CLIENTE.COMPLETADO).length;
    const en_revision = organizaciones.filter(o => o.estado_cliente === ESTADOS_CLIENTE.EN_REVISION).length;
    const pendientes = organizaciones.filter(o => o.estado_cliente === ESTADOS_CLIENTE.PENDIENTE).length;
    const automatizacion = total > 0 ? Math.round((completadas / total) * 100) : 0;
    const precision_ia = 0; // Placeholder hasta tener una señal real
    return { total_organizaciones: total, completadas, en_revision, pendientes, automatizacion, precision_ia };
  }, [organizaciones]);

  const estadosData = React.useMemo(() => ([
    { estado: 'Completadas', cantidad: metricas.completadas, color: '#10b981' },
    { estado: 'En revisión', cantidad: metricas.en_revision, color: '#f59e0b' },
    { estado: 'Pendientes', cantidad: metricas.pendientes, color: '#ef4444' }
  ]), [metricas]);

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
