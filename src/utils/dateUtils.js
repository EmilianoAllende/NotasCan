// src/utils/dateUtils.js
export const getElapsedString = (timestamp) => {
	if (!timestamp) return "Nunca";
	const now = new Date();
	const past = new Date(timestamp);
	const diffInMinutes = Math.floor((now - past) / (1000 * 60));
	if (diffInMinutes < 60) return `hace ${diffInMinutes} minutos`;
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `hace ${diffInHours} horas`;
	const diffInDays = Math.floor(diffInHours / 24);
	return `hace ${diffInDays} días`;
};
