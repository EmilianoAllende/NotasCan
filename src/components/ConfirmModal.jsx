import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Un modal de confirmación genérico.
 *
 * Props:
 * - show (boolean): Controla la visibilidad del modal.
 * - title (string): El título del modal.
 * - message (string): El mensaje de confirmación.
 * - onConfirm (function): Función a ejecutar al confirmar.
 * - onCancel (function): Función a ejecutar al cancelar.
 * - confirmText (string, opcional): Texto del botón de confirmación (default: "Aceptar").
 * - cancelText (string, opcional): Texto del botón de cancelación (default: "Cancelar").
 * - type (string, opcional): 'info' (default) o 'danger' (para acciones destructivas).
 */
const ConfirmModal = ({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  type = "info" 
}) => {
  if (!show) {
    return null;
  }

  const isDanger = type === 'danger';
  const Icon = isDanger ? AlertTriangle : CheckCircle;
  const iconColor = isDanger ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400';
  const confirmButtonColor = isDanger 
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' // --- ESTILO ROJO (PELIGRO) ---
    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'; // --- ESTILO AZUL (NORMAL) ---

  return (
    // Overlay (fondo oscuro)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onCancel} // Cierra al hacer clic fuera
    >
      {/* Contenedor del Modal */}
      <div
        className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el overlay
      >
        <div className="p-6">
          <div className="flex items-start">
            {/* Icono */}
            <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${isDanger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} sm:mx-0 sm:h-10 sm:w-10`}>
              <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
            </div>
            {/* Contenido de texto */}
            <div className="mt-0 ml-4 text-left">
              <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones de Acción */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm ${confirmButtonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm dark:focus:ring-offset-slate-800`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:mt-0 sm:w-auto sm:text-sm dark:focus:ring-offset-slate-800"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

