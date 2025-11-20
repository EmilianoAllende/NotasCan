import React from "react";
import { Plus, Trash2, Save, Mail } from "lucide-react";

const Campaigns = ({
	campanasActivas = [],
	organizaciones = [],
	campaignTemplates = [],
	onSelectTemplateForSend,
	setConfirmProps,
	closeConfirm,
	isLoadingTemplates, // (Opcional, para mostrar un spinner)
	onSaveTemplate, // Función async para guardar/actualizar
	onDeleteTemplate, // Función async para borrar
	onAddTemplate, // Función async para añadir (usa la misma que onSaveTemplate)
}) => {
	const [selectedTplId, setSelectedTplId] = React.useState(
		campaignTemplates[0]?.id || ""
	);
	const selectedTpl = React.useMemo(
		() => campaignTemplates.find((t) => t.id === selectedTplId) || null,
		[campaignTemplates, selectedTplId]
	);
	const [editingTpl, setEditingTpl] = React.useState(() =>
		selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null
	);

	React.useEffect(() => {
		// Sincroniza el editor cuando la plantilla seleccionada cambia (o se refresca la lista)
		setEditingTpl(selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null);
	}, [selectedTpl]); // Sincroniza el ID seleccionado si la lista cambia (ej: después de borrar)

	React.useEffect(() => {
		if (!selectedTplId && campaignTemplates.length > 0) {
			setSelectedTplId(campaignTemplates[0].id);
		} else if (campaignTemplates.length === 0) {
			setSelectedTplId("");
		}
	}, [campaignTemplates, selectedTplId]);

	React.useEffect(() => {
		setEditingTpl(selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null);
	}, [selectedTpl]); // Cargar historial desde API; si falla, usar fallback agrupando campanasActivas

	// Cargar historial desde API; si falla, usar fallback

	const handleFieldChange = (path, value) => {
		if (!editingTpl) return;
		const next = JSON.parse(JSON.stringify(editingTpl)); // path simple: 'title' | 'description' | 'mode' | 'rawPrompt' | 'builder.instructions'...
		const segs = path.split(".");
		let obj = next;
		for (let i = 0; i < segs.length - 1; i++) {
			const k = segs[i];
			obj[k] = obj[k] || {};
			obj = obj[k];
		}
		obj[segs[segs.length - 1]] = value;
		setEditingTpl(next);
	};

	// --- LÓGICA DE ACCIÓN ORIGINAL ---
	// Estas funciones ahora llaman a las props de App.jsx (que llaman a la API)
	const saveTemplate = () => {
		if (!editingTpl) return;
		if (!editingTpl.title || !editingTpl.id) return;
		// Llama a la función del padre (App.jsx) que llama al APIClient
		onSaveTemplate?.(editingTpl);
	};

	const deleteTemplate = () => {
		if (!editingTpl) return;
		// Llama a la función del padre (App.jsx) que llama al APIClient
		onDeleteTemplate?.(editingTpl.id);
		// Limpia la selección (App.jsx refrescará la lista)
		setSelectedTplId("");
		setEditingTpl(null);
	};

	const addTemplate = () => {
		// <-- 1. Quitamos 'async'
		const baseId = "custom_" + Date.now();
		const draft = {
			id: baseId,
			title: "Nueva campaña",
			description: "Descripción breve...",
			mode: "builder",
			rawPrompt: "",
			builder: {
				campaignType: "personalizada",
				instructions: "",
				examplesGood: "",
				examplesBad: "",
				useMetadata: true,
			},
		};

		if (onAddTemplate) {
			onAddTemplate(draft);
		}

		setEditingTpl(draft);
		setSelectedTplId(baseId);
	};

	// --- MANEJADORES CON CONFIRMACIÓN ---
	const handleSaveClick = () => {
		if (!editingTpl) return;
		setConfirmProps({
			show: true,
			title: "Guardar Cambios",
			message: `¿Seguro que quieres guardar los cambios en la plantilla "${editingTpl.title}"?`,
			confirmText: "Sí, guardar",
			cancelText: "No, volver", // Botón de cancelar
			type: "info",
			onConfirm: () => {
				saveTemplate();
				closeConfirm();
			},
		});
	};

	const handleDeleteClick = () => {
		if (!editingTpl) return;
		setConfirmProps({
			show: true,
			title: "Eliminar Plantilla",
			message: `¿Seguro que quieres eliminar la plantilla "${editingTpl.title}"? Esta acción no se puede deshacer.`,
			confirmText: "Sí, eliminar", // Botón de confirmar
			cancelText: "No, volver",
			type: "danger",
			onConfirm: () => {
				deleteTemplate();
				closeConfirm();
			},
		});
	};

	const handleUseClick = () => {
		if (!editingTpl) return;
		setConfirmProps({
			show: true,
			title: "Seleccionar Plantilla",
			message: `¿Quieres seleccionar "${editingTpl.title}" para tu próximo envío?`,
			confirmText: "Sí, seleccionar", // Botón de confirmar
			cancelText: "No, volver",
			type: "info",
			onConfirm: () => {
				onSelectTemplateForSend?.(editingTpl.id);
				closeConfirm();
			},
		});
	};

	return (
		<div className="space-y-10 p-3">
			{/* === Sección 2: Editor de campañas === */}
			<section className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
				{/* Encabezado */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
						✉️ Editor de Plantillas de Campaña
					</h3>
					<button
						onClick={addTemplate}
						className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
						<Plus size={16} /> Nueva plantilla
					</button>
				</div>

				{/* Cuerpo dividido */}
				<div className="grid grid-cols-1 md:grid-cols-3">
					{/* Lista de plantillas */}
					<div className="md:col-span-1 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/20">
						<div className="p-3 space-y-1 max-h-96 overflow-y-auto scrollbar-thin">
							{/* --- ¡NUEVO! Estado de Carga --- */}
							{isLoadingTemplates && (
								<div className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center animate-pulse">
									Cargando plantillas...
								</div>
							)}

							{!isLoadingTemplates && campaignTemplates.length === 0 && (
								<div className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">
									No hay plantillas.
								</div>
							)}
							{campaignTemplates.length > 0
								? campaignTemplates.map((tpl) => (
										<button
											key={tpl.id}
											onClick={() => setSelectedTplId(tpl.id)}
											className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
												selectedTplId === tpl.id
													? "bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 shadow-sm"
													: "border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/40"
											}`}>
											<div className="flex items-center justify-between">
												<span className="font-medium text-slate-800 dark:text-slate-100">
													{tpl.title}
												</span>
												<span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
													{tpl.mode === "raw" ? "RAW" : "Builder"}
												</span>
											</div>
											<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
												{tpl.description}
											</p>
										</button>
								  ))
								: !isLoadingTemplates && (
										<div className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">
											No hay plantillas aún.
										</div>
								  )}
						</div>
					</div>

					{/* Formulario de edición */}
					<div className="md:col-span-2 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
						{!editingTpl ? (
							<div className="p-8 text-center text-sm text-slate-600 dark:text-slate-300 italic">
								{isLoadingTemplates
									? "Cargando..."
									: "Selecciona o crea una plantilla para comenzar a editar."}
							</div>
						) : (
							<div className="p-6 space-y-6">
								{/* --- Título e ID --- */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<div>
										<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
											Título
										</label>
										<input
											type="text"
											value={editingTpl.title}
											onChange={(e) =>
												handleFieldChange("title", e.target.value)
											}
											className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
											ID (solo lectura)
										</label>
										<input
											type="text"
											value={editingTpl.id}
											disabled
											className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
										/>
									</div>
								</div>

								{/* --- Descripción --- */}
								<div>
									<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
										Descripción
									</label>
									<textarea
										rows={2}
										value={editingTpl.description}
										onChange={(e) =>
											handleFieldChange("description", e.target.value)
										}
										className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
									/>
								</div>

								{/* --- Selector de modo --- */}
								<div className="flex items-center gap-3">
									<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
										Modo
									</label>
									<select
										value={editingTpl.mode}
										onChange={(e) => handleFieldChange("mode", e.target.value)}
										className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
										<option value="builder">Builder</option>
										<option value="raw">RAW (prompt completo)</option>
									</select>
								</div>

								{/* --- Campo RAW o Builder --- */}
								{editingTpl.mode === "raw" ? (
									<div>
										<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
											Prompt completo (RAW)
										</label>
										<textarea
											rows={10}
											value={editingTpl.rawPrompt || ""}
											onChange={(e) =>
												handleFieldChange("rawPrompt", e.target.value)
											}
											placeholder="Pega o escribe aquí tu prompt completo"
											className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
										/>
										<p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
											Si usas RAW, no se aplicará el builder visual.
										</p>
									</div>
								) : (
									<div className="p-5 space-y-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
											<div>
												<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
													Tipo de campaña
												</label>
												<input
													type="text"
													value={editingTpl.builder?.campaignType || ""}
													onChange={(e) =>
														handleFieldChange(
															"builder.campaignType",
															e.target.value
														)
													}
													className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
												/>
											</div>

											<div className="flex items-center gap-2 pt-6">
												<input
													id="useMetadata"
													type="checkbox"
													checked={!!editingTpl.builder?.useMetadata}
													onChange={(e) =>
														handleFieldChange(
															"builder.useMetadata",
															e.target.checked
														)
													}
													className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
												/>
												<label
													htmlFor="useMetadata"
													className="text-sm text-slate-700 dark:text-slate-300">
													Usar metadatos (industria, intereses, etc.)
												</label>
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
												Instrucciones adicionales
											</label>
											<textarea
												rows={4}
												value={editingTpl.builder?.instructions || ""}
												onChange={(e) =>
													handleFieldChange(
														"builder.instructions",
														e.target.value
													)
												}
												className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
											<div>
												<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
													Ejemplos (Buenos)
												</label>
												<textarea
													rows={4}
													value={editingTpl.builder?.examplesGood || ""}
													onChange={(e) =>
														handleFieldChange(
															"builder.examplesGood",
															e.target.value
														)
													}
													className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
													Ejemplos (Malos)
												</label>
												<textarea
													rows={4}
													value={editingTpl.builder?.examplesBad || ""}
													onChange={(e) =>
														handleFieldChange(
															"builder.examplesBad",
															e.target.value
														)
													}
													className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
												/>
											</div>
										</div>
									</div>
								)}

								{/* --- Botones de acción --- */}
								<div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
									<button
										onClick={handleUseClick}
										className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/30"
										title="Seleccionar esta plantilla para el envío">
										<Mail size={16} /> Usar en envío
									</button>

									<button
										onClick={handleDeleteClick}
										className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30">
										<Trash2 size={16} /> Eliminar
									</button>

									<button
										onClick={handleSaveClick}
										className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700">
										<Save size={16} /> Guardar cambios
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
};

// --- (El resto de funciones: slugify, buildFallbackHistory, normalizeDate, etc. están aquí debajo, limpias) ---

export default Campaigns;
