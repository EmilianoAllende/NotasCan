import { useState } from 'react';
import { X, Zap } from 'lucide-react';

const AIindicator = ({ metricas, procesando = 0 }) => {
    const [isIndicatorCollapsed, setIsIndicatorCollapsed] = useState(true); 
    const automatizacion = metricas?.automatizacion ?? 0;
    const pendientes = metricas?.pendientes ?? 0;

    return (
        <div
            className={`fixed bottom-6 right-6 shadow-lg transition-all duration-300 ease-in-out z-50 ${ // Agregué z-50 por si acaso
                isIndicatorCollapsed
                    ? 'w-14 h-14 rounded-full bg-green-800 dark:bg-green-400 flex items-center justify-center cursor-pointer hover:bg-green-600 dark:hover:bg-green-800'
                    : 'max-w-sm p-4 bg-white dark:bg-black border-l-4 border-green-500 dark:border-green-700 rounded-lg'
            }`}
            onClick={() => {
                if (isIndicatorCollapsed) {
                    setIsIndicatorCollapsed(false);
                }
            }}
        >
            {isIndicatorCollapsed ? (
                <Zap className="text-white" size={24} />
            ) : (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsIndicatorCollapsed(true);
                        }}
                        className="absolute text-gray-400 top-2 right-2 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-400">Sistema activo</h4>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        <div>• IA procesando: {procesando} organizaciones</div>
                        <div>• Organizaciones pendientes de procesamiento: {pendientes}</div>
                        <div>• Automatización: {automatizacion}% activa</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIindicator;