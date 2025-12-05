import React, { useMemo } from "react";
import { ExternalLink, Activity, Rss, Layers } from "lucide-react";

const ActivityAndTopics = ({ selectedOrg }) => {
    
    const data = useMemo(() => {
        if (!selectedOrg) return null;

    let tags = [];
        try {
            if (selectedOrg.intereses === "indefinido") {
                tags = [];
            } 
            else if (typeof selectedOrg.intereses === "string") {
                const cleanString = selectedOrg.intereses.replace(/[[\]"]/g, '');
                tags = cleanString.split(',').map(s => s.trim()).filter(Boolean);
            } else if (Array.isArray(selectedOrg.intereses)) {
                tags = selectedOrg.intereses;
            }
            
            if ((!tags || tags.length === 0) && typeof selectedOrg.metadata === "string") {
                const meta = JSON.parse(selectedOrg.metadata);
                if (meta.organizacion?.intereses) {
                    const metaIntereses = meta.organizacion.intereses;
                    if (Array.isArray(metaIntereses)) {
                        tags = metaIntereses;
                    } else if (typeof metaIntereses === 'string') {
                        tags = metaIntereses.split(',').map(s => s.trim());
                    }
                }
            }
        } catch (e) {
            console.error("Error parsing interests", e);
            tags = [];
        }

        // Lógica para Posteos
        const hasLastPost = selectedOrg.titulo_posteo && selectedOrg.titulo_posteo !== "indefinido";
        const postUrl = (selectedOrg.url_posteo && selectedOrg.url_posteo !== "indefinido") 
            ? selectedOrg.url_posteo 
            : null;

        return {
            frequency: selectedOrg.frecuencia_comunicacion || selectedOrg.frecuencia || "No def.",
            lastPostDate: selectedOrg.ultimo_posteo || "Sin registro",
            lastPostTitle: hasLastPost ? selectedOrg.titulo_posteo : null,
            lastPostUrl: postUrl,
            subscription: selectedOrg.suscripcion || "inactiva",
            interests: tags
        };
    }, [selectedOrg]);

    if (!data) return null;

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- Actividad Digital --- */}
            <div className="flex flex-col h-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Actividad Digital
                    </h3>
                </div>
                
                <div className="space-y-6 flex-1">
                    {/* Fila Frecuencia */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Frecuencia Est.:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                {data.frequency}
                            </span>
                            <span className="text-xs text-gray-400">post/semana</span>
                        </div>
                    </div>

                    {/* Fila Suscripción */}
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Suscripción:</span>
                        <span
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                                data.subscription === "activa"
                                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                    : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                            }`}>
                            {data.subscription}
                        </span>
                    </div>

                    {/* Sección Última Actividad */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Última Actividad</span>
                            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{data.lastPostDate}</span>
                        </div>
                        
                        {data.lastPostTitle && (
                            <div className="group relative p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                <div className="flex items-start gap-3">
                                    <Rss className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">
                                            "{data.lastPostTitle}"
                                        </p>
                                        {data.lastPostUrl && (
                                            <a
                                                href={data.lastPostUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                Ver publicación <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---Temas Clave --- */}
            <div className="flex flex-col h-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Temas Clave
                    </h3>
                </div>

                <div className="flex-1">
                    <div className="flex flex-wrap gap-2 content-start">
                        {data.interests.length > 0 ? (
                            data.interests.map((tema, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-default select-all">
                                    {tema.replace(/_/g, ' ')}
                                </span>
                            ))
                        ) : (
                            <div className="w-full h-32 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <span className="text-gray-400 dark:text-gray-600 mb-2">¯\_(ツ)_/¯</span>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    Sin temas detectados
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityAndTopics;