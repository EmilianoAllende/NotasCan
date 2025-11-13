import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, CheckCircle, AlertCircle, RefreshCw, Zap, Brain, Download } from 'lucide-react';
import MetricCard from '../shared/MetricCard'

const Dashboard = ({ metricas, estadosData, islasData, sectoresData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <MetricCard icon={Building} title="Total organizaciones" value={metricas.total_organizaciones} color="blue" />
        <MetricCard icon={CheckCircle} title="Completadas" value={metricas.completadas} color="green" subtext="+65% vs anterior" />
        <MetricCard icon={AlertCircle} title="En revisión" value={metricas.en_revision} color="yellow" />
        <MetricCard icon={RefreshCw} title="Pendientes" value={metricas.pendientes} color="red" />
        <MetricCard icon={Zap} title="Automatización" value={`${metricas.automatizacion}%`} color="purple" />
        <MetricCard icon={Brain} title="Precisión IA" value={`${metricas.precision_ia}%`} color="sky" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 text-gray-900 dark:text-gray-100">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Estado de enriquecimiento</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={estadosData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="cantidad"
              >
                {estadosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Distribución por islas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={islasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="isla" angle={-45} textAnchor="end" height={60} fontSize={10} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="organizaciones" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Sectores principales</h3>
          <div className="space-y-3">
            {sectoresData.map((sector, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{sector.sector}</span>
                <span className="text-sm font-medium">{sector.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-gray-900 dark:text-gray-100">
        <h3 className="text-lg font-bold mb-4">Acciones rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200">
            <Zap size={20} />
            <span>Procesar pendientes</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-700 text-green-700 dark:text-green-200">
            <CheckCircle size={20} />
            <span>Aprobar revisiones</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-200">
            <Download size={20} />
            <span>Exportar datos</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-700 text-yellow-700 dark:text-yellow-200">
            <Brain size={20} />
            <span>Configurar IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;