// src/components/common/Pagination.jsx
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	// No renderizar si hay 1 página o menos
	if (totalPages <= 1) return null;

	const maxLeadingPages = 5;
	const pagesToDisplay = new Set(); // 1. Definir los números de página que deben ser visibles // Siempre incluir la primera y la última página

	pagesToDisplay.add(1);
	pagesToDisplay.add(totalPages);
	if (totalPages <= maxLeadingPages + 2) {
		// Caso: Total de páginas pequeño (ej. 7 o menos) - mostrar todas
		for (let i = 1; i <= totalPages; i++) {
			pagesToDisplay.add(i);
		}
	} else if (currentPage <= maxLeadingPages) {
		// Caso 1: Estás al inicio (Mostrar 1 al 5 y la última)
		for (let i = 1; i <= maxLeadingPages; i++) {
			pagesToDisplay.add(i);
		}
	} else if (currentPage > totalPages - maxLeadingPages + 2) {
		// Caso 2: Estás al final (Mostrar las últimas 5 y la primera)
		for (let i = totalPages - maxLeadingPages + 1; i <= totalPages; i++) {
			pagesToDisplay.add(i);
		}
	} else {
		// Caso 3: Estás en el medio (Mostrar 1, [centrado], totalPages)
		pagesToDisplay.add(currentPage - 1);
		pagesToDisplay.add(currentPage);
		pagesToDisplay.add(currentPage + 1);
	} // Convertir el Set a Array, filtrar (por seguridad) y ordenar

	const sortedUniquePages = Array.from(pagesToDisplay)
		.filter((p) => p >= 1 && p <= totalPages)
		.sort((a, b) => a - b); // 2. Generar el array final de elementos con botones y '...'

	const finalElements = [];
	let lastPage = 0;
	for (const page of sortedUniquePages) {
		// Insertar '...' si hay un salto de más de 1 página
		if (page > lastPage + 1) {
			finalElements.push("...");
		}
		finalElements.push(page);
		lastPage = page;
	} // 3. Renderizar el output
	return (
		<nav
			className="flex items-center space-x-1"
			aria-label="Navegación de Páginas">
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="px-3 py-2 text-sm font-medium rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
				Anterior
			</button>
			{finalElements.map((item, index) => {
				if (item === "...") {
					return (
						<span
							key={`elipsis-${index}`}
							className="px-2 text-gray-400"
							aria-hidden="true">
							  ...
						</span>
					);
				}

				const number = item;
				return (
					<button
						key={number}
						onClick={() => onPageChange(number)}
						aria-current={number === currentPage ? "page" : undefined}
						className={`
                        w-9 h-9 flex items-center justify-center 
                        text-sm font-medium rounded-full transition
                        ${
							number === currentPage
								? "bg-blue-600 text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
								: "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
						}
                    `}>
						{" "}
						{number}
					</button>
				);
			})}
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages || totalPages === 0}
				className="px-3 py-2 text-sm font-medium rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
				Siguiente
			</button>
		</nav>
	);
};

export default Pagination;
