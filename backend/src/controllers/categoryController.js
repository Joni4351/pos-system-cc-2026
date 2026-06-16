const pool = require('../config/database');

// ============================================================================
// 1. OBTENER TODAS LAS CATEGORÍAS ACTIVAS
// ============================================================================
const getAll = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias WHERE activo = true ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).json({ error: 'Hubo un problema al cargar la lista de categorías.' });
  }
};

// ============================================================================
// 2. CREAR UNA NUEVA CATEGORÍA
// ============================================================================
const create = async (req, res) => {
  try {
    let { nombre, descripcion } = req.body;

    // VALIDACIÓN 1: El nombre no puede venir vacío ni ser solo espacios
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
    }

    // Limpiamos los espacios sobrantes al inicio y al final
    nombre = nombre.trim();
    descripcion = descripcion ? descripcion.trim() : null;

    // VALIDACIÓN 2: Que el nombre no sea exageradamente largo
    if (nombre.length > 50) {
      return res.status(400).json({ error: 'El nombre es muy largo (máximo 50 letras).' });
    }

    // VALIDACIÓN 3: Evitar categorías repetidas
    const existe = await pool.query('SELECT id FROM categorias WHERE nombre = $1', [nombre]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre.' });
    }

    // Si pasa las pruebas, guardamos en la base de datos
    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Error al crear categoría:', err);
    res.status(500).json({ error: 'No se pudo guardar la categoría en el sistema.' });
  }
};

// ============================================================================
// 3. EDITAR UNA CATEGORÍA EXISTENTE
// ============================================================================
const update = async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, descripcion } = req.body;

    // VALIDACIÓN 1: Comprobar que el ID de la URL sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El número identificador de la categoría no es válido.' });
    }

    // VALIDACIÓN 2: Si envían un nombre nuevo, que no esté vacío
    if (nombre !== undefined) {
      if (nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre no puede quedar vacío al editar.' });
      }
      nombre = nombre.trim();
    }

    if (descripcion !== undefined) {
      descripcion = descripcion.trim();
    }

    // Actualizamos los datos
    const result = await pool.query(
      'UPDATE categorias SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion) WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );

    // VALIDACIÓN 3: Si la base de datos no devolvió nada, es porque no la encontró
    if (!result.rows.length) {
      return res.status(404).json({ error: 'No encontramos la categoría que intentas editar.' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error al actualizar categoría:', err);
    res.status(500).json({ error: 'No se pudo actualizar la información de la categoría.' });
  }
};

// ============================================================================
// 4. ELIMINAR (DESACTIVAR) UNA CATEGORÍA
// ============================================================================
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // VALIDACIÓN 1: Comprobar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El número identificador de la categoría no es válido.' });
    }

    // Desactivamos la categoría (eliminación lógica)
    const result = await pool.query(
      'UPDATE categorias SET activo = false WHERE id = $1 RETURNING *', 
      [id]
    );

    // VALIDACIÓN 2: Comprobar si la categoría realmente existía
    if (!result.rows.length) {
      return res.status(404).json({ error: 'La categoría no existe o ya había sido borrada.' });
    }

    res.json({ message: 'Categoría eliminada correctamente del sistema.' });

  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.status(500).json({ error: 'Hubo un problema al intentar eliminar la categoría.' });
  }
};

module.exports = { getAll, create, update, remove };
