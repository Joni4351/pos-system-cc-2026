'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api'; // Ajusta la ruta si es necesario

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [busqueda, setBusqueda] = useState(''); // Estado para el buscador
  const [cargandoLista, setCargandoLista] = useState(true); // Estado de carga inicial
  
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Estado para mostrar errores del backend

  // Cargar las categorías al iniciar
  const load = async () => {
    try {
      setCargandoLista(true);
      const respuesta = await api.get('/categories');
      setCategories(respuesta.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  // Funciones para abrir la ventana modal
  const openCreate = () => { 
    setForm({ nombre: '', descripcion: '' }); 
    setErrorMsg(''); // Limpiamos errores anteriores
    setModal('create'); 
  };
  
  const openEdit = (c) => { 
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); 
    setErrorMsg(''); // Limpiamos errores anteriores
    setModal(c); 
  };

  // Función para guardar (Crear o Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(''); // Limpiamos el mensaje de error antes de intentar
    
    try {
      if (modal === 'create') {
        await api.post('/categories', form);
      } else {
        await api.put(`/categories/${modal.id}`, form);
      }
      setModal(null); // Cerramos el modal si todo salió bien
      load(); // Recargamos la tabla
    } catch (err) {
      // Si el backend nos frena (ej: nombre duplicado), mostramos el error elegante
      setErrorMsg(err.response?.data?.error || 'Hubo un error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  };

  // Función para eliminar (Desactivar)
  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      load(); // Recargamos la tabla
    } catch (err) {
      alert(err.response?.data?.error || 'Error al intentar eliminar la categoría.');
    }
  };

  // LÓGICA DEL BUSCADOR
  const categoriasFiltradas = categories.filter((c) => {
    const termino = busqueda.toLowerCase();
    const nombreValido = c.nombre ? c.nombre.toLowerCase() : '';
    const descValida = c.descripcion ? c.descripcion.toLowerCase() : '';
    
    return nombreValido.includes(termino) || descValida.includes(termino);
  });

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm">Gestiona las agrupaciones de tus productos</p>
        </div>
        <button onClick={openCreate} className="btn-primary whitespace-nowrap">
          + Nueva categoría
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input 
          type="text" 
          placeholder="Buscar categoría por nombre o descripción..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Nombre</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Descripción</th>
                <th className="p-4 font-semibold text-gray-600 text-sm w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargandoLista ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-8">Cargando categorías...</td>
                </tr>
              ) : categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-8">
                    {busqueda !== '' ? 'No se encontraron resultados para tu búsqueda.' : 'Aún no hay categorías registradas.'}
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{c.nombre}</td>
                    <td className="p-4 text-gray-500">{c.descripcion || '—'}</td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(c)} className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-medium">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 hover:underline text-sm font-medium">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VENTANA MODAL (CREAR / EDITAR) */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {modal === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* CUADRO DE ERROR DEL BACKEND */}
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input 
                  required 
                  maxLength={50}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={form.nombre} 
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                  placeholder="Ej: Bebidas"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <input 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={form.descripcion} 
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                  placeholder="Ej: Gaseosas y jugos naturales"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="btn-primary flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
