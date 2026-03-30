import { Router } from 'express';
import { Paciente, Usuario, ProfesionalPaciente, Curricula, Adaptacion, Informe } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = Router();
router.use(authMiddleware);

// Listar pacientes accesibles para el usuario
router.get('/', async (req, res) => {
  try {
    let pacientes;
    if (req.user.rol === 'admin') {
      pacientes = await Paciente.findAll({ where: { activo: true }, order: [['apellido', 'ASC']] });
    } else {
      const relaciones = await ProfesionalPaciente.findAll({ where: { usuarioId: req.user.id, activo: true } });
      const ids = relaciones.map(r => r.pacienteId);
      pacientes = await Paciente.findAll({ where: { id: { [Op.in]: ids }, activo: true }, order: [['apellido', 'ASC']] });
    }
    res.json(pacientes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Detalle de un paciente
router.get('/:id', async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id, {
      include: [
        {
          model: Usuario,
          as: 'profesionales',
          attributes: { exclude: ['password'] },
          through: { attributes: ['id', 'activo'] },
        },
        {
          model: Curricula,
          as: 'curriculas',
          include: [
            { model: Usuario, as: 'subidoPor', attributes: ['id', 'nombre', 'apellido'] },
            {
              model: Adaptacion,
              as: 'adaptaciones',
              order: [['version', 'DESC']],
            },
          ],
        },
        {
          model: Informe,
          as: 'informes',
          include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'apellido', 'especialidad'] }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    // Verificar acceso
    if (req.user.rol !== 'admin') {
      const rel = await ProfesionalPaciente.findOne({ where: { pacienteId: paciente.id, usuarioId: req.user.id, activo: true } });
      if (!rel) return res.status(403).json({ error: 'Sin acceso a este paciente' });
    }

    res.json(paciente);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Crear paciente (admin)
router.post('/', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
    const paciente = await Paciente.create(req.body);
    res.status(201).json(paciente);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Editar paciente (admin)
router.put('/:id', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    await paciente.update(req.body);
    res.json(paciente);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Asignar/quitar profesional a un paciente (admin)
router.post('/:id/profesionales', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
    const { usuarioId } = req.body;
    const [rel, created] = await ProfesionalPaciente.findOrCreate({
      where: { pacienteId: req.params.id, usuarioId },
      defaults: { activo: true },
    });
    if (!created) await rel.update({ activo: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id/profesionales/:usuarioId', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
    await ProfesionalPaciente.update(
      { activo: false },
      { where: { pacienteId: req.params.id, usuarioId: req.params.usuarioId } }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
