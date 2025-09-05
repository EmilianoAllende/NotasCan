import React from 'react';

// Objeto que mapea los colores a las clases completas de Tailwind
const colorStyles = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    icon: 'text-blue-600 dark:text-blue-300',
    value: 'text-blue-900 dark:text-blue-200',
    subtext: 'text-blue-600 dark:text-blue-200',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900',
    icon: 'text-green-600 dark:text-green-300',
    value: 'text-green-900 dark:text-green-200',
    subtext: 'text-green-600 dark:text-green-200',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    icon: 'text-yellow-600 dark:text-yellow-300',
    value: 'text-yellow-900 dark:text-yellow-200',
    subtext: 'text-yellow-600 dark:text-yellow-200',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900',
    icon: 'text-red-600 dark:text-red-300',
    value: 'text-red-900 dark:text-red-200',
    subtext: 'text-red-600 dark:text-red-200',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    icon: 'text-purple-600 dark:text-purple-300',
    value: 'text-purple-900 dark:text-purple-200',
    subtext: 'text-purple-600 dark:text-purple-200',
  },
  sky: {
    bg: 'bg-sky-100 dark:bg-sky-900',
    icon: 'text-sky-600 dark:text-sky-300',
    value: 'text-sky-900 dark:text-sky-200',
    subtext: 'text-sky-600 dark:text-sky-200',
  },
  // ✨ Podés agregar más colores acá (ej: 'red', 'pink', etc.)
};

const MetricCard = ({ icon: Icon, title, value, color = 'blue', subtext }) => {
  // Se obtienen los estilos del objeto. Si el color no existe, usa 'blue' por defecto.
  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`${styles.bg} p-4 rounded-lg`}>
      <Icon className={`${styles.icon} mb-2`} size={24} />
      <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
      <p className={`text-2xl font-bold ${styles.value}`}>{value}</p>
      {subtext && <p className={`text-xs ${styles.subtext}`}>{subtext}</p>}
    </div>
  );
};

export default MetricCard;