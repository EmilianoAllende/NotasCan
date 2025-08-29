import { useState } from 'react';
import { metricas } from '../data/data';
import { X, Zap } from 'lucide-react';

const AIindicator = () => {
    const [isIndicatorCollapsed, setIsIndicatorCollapsed] = useState(false);

    return (
            <div
                className={`fixed bottom-6 right-6 shadow-lg transition-all duration-300 ease-in-out ${
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
                <div>• IA procesando: 12 organizaciones</div>
                <div>• Automatización: {metricas.automatizacion}% activa</div>
                </div>
            </>
            )}
        </div>
    );
};

export default AIindicator;