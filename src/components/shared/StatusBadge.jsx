import React from 'react';

const StatusBadge = ({ estado }) => {
  let colorClass = '';
  let text = '';

  switch (estado) {
    case 'completo':
      colorClass = 'bg-green-100 text-green-800';
      text = 'Completado';
      break;
    case 'revision':
      colorClass = 'bg-yellow-100 text-yellow-800';
      text = 'En revisión';
      break;
    case 'pendiente':
      colorClass = 'bg-red-100 text-red-800';
      text = 'Pendiente';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
      text = 'Desconocido';
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {text}
    </span>
  );
};

export default StatusBadge;