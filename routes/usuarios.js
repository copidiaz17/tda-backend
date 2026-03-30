import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Listar todos los profesionales (para asignar a pacientes)
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { activo: true },
      attributes: { exclude: ['password'] },
      order: [['apellido', 'ASC']],
    });
    res.json(usuarios);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Crear usuario (solo admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, especialidad } = req.body;
    if (!nombre || !apellido || !email || !password) return res.status(400).json({ error: 'Faltan campos obligatorios' });

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, apellido, email, password: hash, rol, especialidad });
    const { password: _, ...datos } = usuario.toJSON();
    res.status(201).json(datos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Editar usuario (admin o el mismo usuario)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) return res.status(403).json({ error: 'Sin permiso' });

    const { nombre, apellido, email, password, rol, especialidad, activo } = req.body;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const updates = { nombre, apellido, email, especialidad };
    if (req.user.rol === 'admin') { updates.rol = rol; updates.activo = activo; }
    if (password) updates.password = await bcrypt.hash(password, 10);

    await usuario.update(updates);
    const { password: _, ...datos } = usuario.toJSON();
    res.json(datos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
