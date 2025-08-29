import React from 'react';

const EditOrganizationModal = ({ show, onClose, editingOrg, setEditingOrg, onSave }) => {
  if (!show || !editingOrg) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Editar organización: {editingOrg.nombre}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={editingOrg.nombre}
              onChange={(e) => setEditingOrg({ ...editingOrg, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editingOrg.email}
              onChange={(e) => setEditingOrg({ ...editingOrg, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
              <input
                type="text"
                value={editingOrg.municipio}
                onChange={(e) => setEditingOrg({ ...editingOrg, municipio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Isla</label>
              <select
                value={editingOrg.isla}
                onChange={(e) => setEditingOrg({ ...editingOrg, isla: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Seleccionar isla</option>
                <option value="Gran Canaria">Gran Canaria</option>
                <option value="Tenerife">Tenerife</option>
                <option value="Lanzarote">Lanzarote</option>
                <option value="Fuerteventura">Fuerteventura</option>
                <option value="La Palma">La Palma</option>
                <option value="La Gomera">La Gomera</option>
                <option value="El Hierro">El Hierro</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={editingOrg.tipo}
                onChange={(e) => setEditingOrg({ ...editingOrg, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Seleccionar tipo</option>
                <option value="Administración Pública">Administración Pública</option>
                <option value="Empresa">Empresa</option>
                <option value="Agencia">Agencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={editingOrg.estado}
                onChange={(e) => setEditingOrg({ ...editingOrg, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="pendiente">Pendiente</option>
                <option value="revision">En revisión</option>
                <option value="completo">Completado</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrganizationModal;