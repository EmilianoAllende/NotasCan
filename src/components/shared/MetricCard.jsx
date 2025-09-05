import React from 'react';

const MetricCard = ({ icon: Icon, title, value, color, subtext }) => {
  const cardBgClass = `bg-${color}-100`;
  const cardDarkBgClass = `bg-${color}-900`;
  const iconTextClass = `text-${color}-600`;
  const iconDarkTextClass = `text-${color}-300`;
  const valueClass = `text-${color}-900`;
  const valueDarkClass = `text-${color}-200`;
  const subtextClass = `text-${color}-600`;
  const subtextDarkClass = `text-${color}-200`;

  return (
    <div className={`${cardBgClass} p-4 rounded-lg dark:${cardDarkBgClass}`}>
      <Icon className={`${iconTextClass} mb-2 dark:${iconDarkTextClass}`} size={24} />
      <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
      <p className={`text-2xl font-bold ${valueClass} dark:${valueDarkClass}`}>{value}</p>
      {subtext && <p className={`text-xs ${subtextClass} ${subtextDarkClass}`}>{subtext}</p>}
    </div>
  );
};

export default MetricCard;