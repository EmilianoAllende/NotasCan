import React, { useState, useEffect } from "react";
import {
	ChevronDown,
	ChevronRight,
	RefreshCw,
	CheckCircle2,
} from "lucide-react";

const CampaignHistory = ({
	campanasActivas = [],
	organizaciones = [],
	campaignTemplates = [],
	historyData,
	isLoading,
	onRefresh,
}) => {
	const [displayHistory, setDisplayHistory] = useState({
		types: [],
		summary: { hace_dias_ultima_campana: null },
	});

	const [expandedType, setExpandedType] = useState(null);
	const [expandedDateByType, setExpandedDateByType] = useState({});
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		if (historyData) {
			setDisplayHistory(historyData);
		} else if (!isLoading && typeof onRefresh === "function") {
			onRefresh();
		}

		if (!historyData && campanasActivas.length > 0) {
			setDisplayHistory(
				buildFallbackHistory(campanasActivas, campaignTemplates, organizaciones)
			);
		}
	}, [
		historyData,
		isLoading,
		onRefresh,
		campanasActivas,
		campaignTemplates,
		organizaciones,
	]);

	const handleManualRefresh = async () => {
		if (onRefresh) {
			await onRefresh();
			setShowSuccess(true);
			setTimeout(() => {
				setShowSuccess(false);
			}, 3000);
		}
	};

	// --- HANDLERS DE ACORDEONES ---
	const toggleType = (typeId) => {
		setExpandedType((prev) => (prev === typeId ? null : typeId));
		setExpandedDateByType((prev) => ({
			...prev,
			[typeId]: prev[typeId] || null,
		}));
	};

	const toggleDate = (typeId, dateStr) => {
		setExpandedDateByType((prev) => ({
			...prev,
			[typeId]: prev[typeId] === dateStr ? null : dateStr,
		}));
	};

	return (
		<div className={styles.container}>
			<div className={styles.card}>

				{/* Encabezado con Botón Refresh y Mensaje de Éxito */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-3">
						<h3 className={styles.headerTitle}>📅 Historial de Campañas</h3>

						{/* --- MENSAJE DE ÉXITO TEMPORAL --- */}
						{showSuccess && (
							<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium animate-fadeIn">
								<CheckCircle2 size={14} /> Actualizado
							</span>
						)}
					</div>

					<button
						onClick={handleManualRefresh}
						disabled={isLoading}
						className={styles.refreshButton}
						title="Actualizar historial">
						<RefreshCw
							size={18}
							className={isLoading ? "animate-spin text-blue-600" : ""}
						/>
					</button>
				</div>

				{/* Resumen / Estado */}
				<div className={styles.summaryText}>
					{isLoading && !historyData ? (
						<span className="text-blue-600">Cargando datos...</span>
					) : displayHistory.summary?.hace_dias_ultima_campana != null ? (
						<span>
							Última campaña enviada: hace{" "}
							{displayHistory.summary.hace_dias_ultima_campana} días
						</span>
					) : (
						<span>No hay información de envíos recientes.</span>
					)}
				</div>

				{/* Lista Principal */}
				<div className={styles.listContainer}>
					{displayHistory.types.map((t) => {
						const isTypeExpanded = expandedType === t.id;

						return (
							<div key={t.id} className={styles.typeItemBorder}>
								<button
									onClick={() => toggleType(t.id)}
									className={`${styles.typeButtonBase} ${
										isTypeExpanded
											? styles.typeButtonActive
											: styles.typeButtonInactive
									}`}>
									<div>
										<div className="flex items-center gap-2">
											{isTypeExpanded ? (
												<ChevronDown size={16} className="text-blue-600" />
											) : (
												<ChevronRight size={16} />
											)}
											<span className="font-medium text-slate-900 dark:text-slate-100">
												{t.title}
											</span>
										</div>
										<p className="ml-6 text-sm text-slate-600 dark:text-slate-400">
											{t.description}
										</p>
									</div>
									{t.last_sent_hace_dias != null && (
										<span className="text-xs text-slate-500">
											hace {t.last_sent_hace_dias} días
										</span>
									)}
								</button>

								{isTypeExpanded && (
									<div className={styles.datesContainer}>
										{t.dates && t.dates.length > 0 ? (
											<div className="space-y-2">
												{t.dates.map((d) => {
													const isDateExpanded =
														expandedDateByType[t.id] === d.date;

													return (
														<div key={d.date} className={styles.dateCard}>
															<button
																onClick={() => toggleDate(t.id, d.date)}
																className={`${styles.dateButtonBase} ${
																	isDateExpanded
																		? styles.dateButtonActive
																		: styles.dateButtonInactive
																}`}>
																<div className="flex items-center gap-2">
																	{isDateExpanded ? (
																		<ChevronDown size={14} />
																	) : (
																		<ChevronRight size={14} />
																	)}
																	<span className="text-sm text-slate-800 dark:text-slate-200">
																		{d.date}
																	</span>
																</div>
																<span className="text-xs text-slate-600 dark:text-slate-300">
																	{d.organizations?.length || 0} orgs
																</span>
															</button>

															{isDateExpanded && (
																<div className={styles.orgsContainer}>
																	{(d.organizations || []).length === 0 ? (
																		<p className="text-sm text-slate-600 dark:text-slate-300">
																			Sin organizaciones.
																		</p>
																	) : (
																		<ul className={styles.orgsList}>
																			{d.organizations.map((o, idx) => (
																				<li key={o.id || idx}>
																					{o.name || o.organizacion || o}
																				</li>
																			))}
																		</ul>
																	)}
																</div>
															)}
														</div>
													);
												})}
											</div>
										) : (
											<p className="text-sm text-slate-600 dark:text-slate-300">
												No hay fechas registradas.
											</p>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

// --- ESTILOS ---
const styles = {
	container: "space-y-6 p-6",
	card: "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5",
	headerTitle: "text-xl font-semibold text-slate-900 dark:text-slate-100",
	refreshButton:
		"p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50",
	summaryText: "text-sm text-slate-700 dark:text-slate-300 mb-4 h-5",
	listContainer:
		"border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden",
	typeItemBorder:
		"border-b border-slate-200 dark:border-slate-700 last:border-b-0",
	typeButtonBase:
		"w-full flex items-start justify-between text-left p-4 transition-colors duration-200",
	typeButtonActive: "bg-slate-50 dark:bg-slate-700/50",
	typeButtonInactive: "hover:bg-slate-50 dark:hover:bg-slate-700/30",
	datesContainer:
		"p-4 pt-0 ml-6 border-l border-slate-200 dark:border-slate-600",
	dateCard:
		"border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden",
	dateButtonBase:
		"w-full flex items-center justify-between px-3 py-2 transition-colors",
	dateButtonActive: "bg-slate-100 dark:bg-slate-700",
	dateButtonInactive: "bg-white dark:bg-slate-800 hover:bg-slate-50",
	orgsContainer: "px-4 pb-3 pt-2 bg-white dark:bg-slate-800",
	orgsList:
		"list-disc list-inside text-sm text-slate-800 dark:text-slate-200 space-y-1",
};

// --- HELPERS ---
function slugify(str) {
	return (str || "")
		.toString()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "");
}

function buildFallbackHistory(
	campanasActivas,
	campaignTemplates,
	organizaciones
) {
	const hasLogs =
		Array.isArray(organizaciones) &&
		organizaciones.some(
			(o) => o && o.campaigns_log && typeof o.campaigns_log === "object"
		);
	if (hasLogs) {
		const typeMap = new Map();
		const allDates = [];
		organizaciones.forEach((org) => {
			const log = org?.campaigns_log;
			if (!log || typeof log !== "object") return;
			Object.entries(log).forEach(([key, info]) => {
				if (!info) return;
				const id = extractTemplateId(key);
				const tpl = campaignTemplates.find((t) => t.id === id);
				const title = tpl?.title || info.template_title || id;
				const description = tpl?.description || "";
				if (!typeMap.has(id))
					typeMap.set(id, { id, title, description, dates: new Map() });
				const entry = typeMap.get(id);
				const last = normalizeDate(info.last_sent);
				if (last) {
					allDates.push(last);
					if (!entry.dates.has(last)) entry.dates.set(last, []);
					entry.dates.get(last).push({
						name: org.organizacion || org.nombre || org.id || "Org",
						id: org.id,
					});
				}
			});
		});

		const types = Array.from(typeMap.values()).map((t) => ({
			id: t.id,
			title: t.title,
			description: t.description,
			last_sent_at: null,
			last_sent_hace_dias: null,
			dates: Array.from(t.dates.entries())
				.sort((a, b) => b[0].localeCompare(a[0]))
				.map(([date, orgs]) => ({ date, organizations: orgs })),
		}));

		let hace_dias = null;
		if (allDates.length) {
			const newest = allDates.sort((a, b) => b.localeCompare(a))[0];
			hace_dias = daysSince(newest);
		}
		return { types, summary: { hace_dias_ultima_campana: hace_dias } };
	}

	const titleToId = Object.fromEntries(
		campaignTemplates.map((t) => [t.title, t.id])
	);
	const map = new Map();
	(campanasActivas || []).forEach((c) => {
		const id = titleToId[c.tipo] || slugify(c.tipo);
		if (!map.has(id)) {
			const tpl = campaignTemplates.find((t) => t.id === id) || {
				title: c.tipo,
				description: "",
			};
			map.set(id, {
				id,
				title: tpl.title || c.tipo,
				description: tpl.description || "",
				dates: new Map(),
			});
		}
		const entry = map.get(id);
		const date = normalizeDate(c.fecha_envio);
		if (!entry.dates.has(date)) entry.dates.set(date, []);
		entry.dates.get(date).push({ name: c.organizacion, id: c.id });
	});
	const types = Array.from(map.values()).map((t) => ({
		id: t.id,
		title: t.title,
		description: t.description,
		last_sent_at: null,
		last_sent_hace_dias: null,
		dates: Array.from(t.dates.entries())
			.sort((a, b) => b[0].localeCompare(a[0]))
			.map(([date, orgs]) => ({ date, organizations: orgs })),
	}));
	let hace_dias = null;
	if (Array.isArray(organizaciones) && organizaciones.length) {
		const values = organizaciones
			.map((o) => o?.hace_dias)
			.filter((v) => Number.isFinite(v));
		if (values.length) hace_dias = Math.min(...values);
	}
	return { types, summary: { hace_dias_ultima_campana: hace_dias } };
}

function normalizeDate(d) {
	if (!d) return "";
	if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
	const m = d.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	if (m) return `${m[3]}-${m[2]}-${m[1]}`;
	return d;
}

function extractTemplateId(key) {
	if (!key) return "";
	return key;
}

function daysSince(isoOrYMD) {
	try {
		const dateStr = normalizeDate(isoOrYMD?.slice(0, 10));
		const dt = new Date(dateStr);
		if (Number.isNaN(dt.getTime())) return null;
		const now = new Date();
		const diffMs = now.getTime() - dt.getTime();
		return Math.floor(diffMs / (1000 * 60 * 60 * 24));
	} catch {
		return null;
	}
}

export default CampaignHistory;