import React, { useMemo } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";
import {
	Building,
	CheckCircle,
	AlertCircle,
	RefreshCw,
	Zap,
	Brain,
} from "lucide-react";
import MetricCard from "../shared/MetricCard";

const Dashboard = ({ metricas, estadosData, islasData, sectoresData }) => {
	
	// Calculamos el valor máximo de sectores para las barras de progreso
	const maxSectorValue = useMemo(() => {
		if (!sectoresData || sectoresData.length === 0) return 0;
		return Math.max(...sectoresData.map((s) => s.cantidad));
	}, [sectoresData]);

	// Protección por si las métricas aún no cargan
	const safeMetricas = metricas || {
		total: 0,
		orgsAutomatizables: 0,
		en_revision: 0,
		pendientes: 0,
		automatizacion: 0,
		precision_ia: 0,
	};

	return (
		<div className="space-y-8 p-4 sm:p-8 animate-fade-in">
			{/* --- Sección de Tarjetas (KPIs) --- */}
			<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
				<MetricCard
					icon={Building}
					title="Total Orgs."
					value={safeMetricas.total}
					color="blue"
				/>
				<MetricCard
					icon={CheckCircle}
					title="Listas para IA"
					value={safeMetricas.orgsAutomatizables} // Dato real calculado
					color="green"
					subtext="Email + Activa"
				/>
				<MetricCard
					icon={AlertCircle}
					title="En revisión"
					value={safeMetricas.en_revision}
					color="yellow"
				/>
				<MetricCard
					icon={RefreshCw}
					title="Pendientes"
					value={safeMetricas.pendientes}
					color="red"
				/>
				<MetricCard
					icon={Zap}
					title="Automatización"
					value={`${safeMetricas.automatizacion}%`}
					color="purple"
					subtext="Disponibilidad"
				/>
				<MetricCard
					icon={Brain}
					title="Precisión IA"
					value={`${safeMetricas.precision_ia}%`}
					color="sky"
					subtext="Estimada"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-900 dark:text-gray-100">
				
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
					<h3 className="text-lg font-bold mb-4">Estado de la Base de Datos</h3>
					<div className="flex-1 min-h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
    data={estadosData}
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={80}
    paddingAngle={5}
    dataKey="cantidad"      // <--- Ya tienes esto (el valor numérico)
    nameKey="estado"        // <--- AGREGA ESTO (El nombre de la categoría)
>
									{estadosData.map((entry, index) => (
										<Cell 
											key={`cell-${index}`} 
											fill={entry.color} 
											stroke="none"
										/>
									))}
								</Pie>
								<Tooltip 
									contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
								/>
								<Legend verticalAlign="bottom" height={36} iconType="circle"/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* 2. Gráfico de Barras (Islas) */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
					<h3 className="text-lg font-bold mb-4">Distribución por Islas</h3>
					<div className="flex-1 min-h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={islasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
								<XAxis
									dataKey="isla"
									angle={-45}
									textAnchor="end"
									height={60}
									tick={{ fontSize: 11, fill: '#6b7280' }}
									interval={0}
								/>
								<YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
								<Tooltip 
									cursor={{ fill: 'rgba(0,0,0,0.05)' }}
									contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
								/>
								<Bar 
									dataKey="organizaciones" 
									fill="#3b82f6" 
									radius={[4, 4, 0, 0]} 
									barSize={30}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* 3. Lista de Sectores (Con barras de progreso) */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
					<h3 className="text-lg font-bold mb-6">Top Sectores</h3>
					<div className="space-y-5 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
						{sectoresData.map((sector, index) => {
							// Calculamos porcentaje para la barra visual
							const percent = maxSectorValue > 0 ? (sector.cantidad / maxSectorValue) * 100 : 0;
							
							return (
								<div key={index} className="group">
									<div className="flex justify-between items-center mb-1.5">
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[70%] capitalize">
											{sector.sector.replace(/_/g, ' ')}
										</span>
										<span className="text-sm font-bold text-gray-900 dark:text-gray-100">
											{sector.cantidad}
										</span>
									</div>
									{/* Barra de progreso */}
									<div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
										<div 
											className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out group-hover:bg-blue-400"
											style={{ width: `${percent}%` }}
										/>
									</div>
								</div>
							);
						})}
						{sectoresData.length === 0 && (
							<div className="text-center text-gray-400 py-8 text-sm">
								Sin datos de sectores
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;