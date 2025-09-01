import React, { useState, useEffect } from 'react';

// CAMBIO 1: El componente ahora solo recibe 'show', 'onClose', 'editingOrg' y 'onSave'.
const EditOrganizationModal = ({ show, onClose, editingOrg, onSave }) => {
  // CAMBIO 2: Creamos un estado interno para el formulario.
  const [formData, setFormData] = useState(null);

  // CAMBIO 3: Usamos useEffect para rellenar el formulario cuando se abre el modal.
  useEffect(() => {
    // Cuando el prop 'editingOrg' cambia (es decir, abrimos el modal para un nuevo item),
    // copiamos sus datos a nuestro estado interno 'formData'.
    if (editingOrg) {
      setFormData({ ...editingOrg });
    }
  }, [editingOrg]);

  // CAMBIO 4: Función para manejar los cambios en los inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Actualizamos solo el estado interno del modal.
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // El botón "Guardar" llamará a esta función.
  const handleSave = () => {
    onSave(formData); // Pasamos el objeto completo y actualizado al padre (App.jsx)
  };

  // Si no se debe mostrar el modal o no hay datos, no renderizamos nada.
  if (!show || !formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold dark:text-white">Editar organización: {formData.organizacion || formData.id}</h2>
        
        {/* CAMBIO 5: El formulario ahora usa el estado interno 'formData' */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Usamos grid para un layout más ordenado */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Organización</label>
              <input
                type="text"
                name="organizacion" // El 'name' debe coincidir con la clave del objeto
                value={formData.organizacion === '[vacio]' ? '' : formData.organizacion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Contacto</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre === '[vacio]' ? '' : formData.nombre || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
              <input
                type="text"
                name="rol"
                value={formData.rol === '[vacio]' ? '' : formData.rol || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono === 0 ? '' : formData.telefono || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Isla</label>
              <input
                type="text"
                name="isla"
                value={formData.isla === '[vacio]' ? '' : formData.isla || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Municipio</label>
              <input
                type="text"
                name="municipio"
                value={formData.municipio === '[vacio]' ? '' : formData.municipio || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:text-gray-200 dark:border-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave} // Usamos la nueva función de guardado
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrganizationModal;