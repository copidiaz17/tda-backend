import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { Tarea, Paciente, Informe, Curricula, Usuario } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { extraerTexto } from '../utils/fileParser.js';
import { adaptarTarea } from '../utils/ia.js';

const router = Router();
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: 'uploads/tareas/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Listar tareas de un paciente
router.get('/paciente/:pacienteId', async (req, res) => {
  try {
    const tareas = await Tarea.findAll({
      where: { pacienteId: req.params.pacienteId },
      include: [
        { model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'apellido', 'especialidad'] },
        { model: Curricula, as: 'curricula', attributes: ['id', 'nombre', 'materia'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(tareas);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Crear tarea (con o sin archivo)
router.post('/', upload.single('archivo'), async (req, res) => {
  try {
    const { pacienteId, titulo, tipo, materia, descripcionOriginal, curriculaId } = req.body;
    if (!pacienteId || !titulo || !tipo) return res.status(400).json({ error: 'Faltan campos obligatorios' });

    let textoExtraido = null;
    let archivoNombre = null;
    let archivoPath = null;

    if (req.file) {
      archivoNombre = req.file.originalname;
      archivoPath = req.file.path;
      textoExtraido = await extraerTexto(req.file.path, req.file.originalname);
    }

    const tarea = await Tarea.create({
      pacienteId, titulo, tipo, materia,
      curriculaId: curriculaId || null,
      descripcionOriginal,
      archivoNombre, archivoPath,
      textoExtraido,
      autorId: req.user.id,
    });

    res.status(201).json(tarea);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Adaptar tarea con IA
router.post('/:id/adaptar', async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const textoTarea = tarea.textoExtraido || tarea.descripcionOriginal;
    if (!textoTarea) return res.status(400).json({ error: 'La tarea no tiene contenido de texto para adaptar' });

    const paciente = await Paciente.findByPk(tarea.pacienteId);

    // Obtener informes previos para dar contexto a la IA
    const informesPrevios = await Informe.findAll({
      where: { pacienteId: paciente.id },
      include: [{ model: Usuario, as: 'autor', attributes: ['nombre', 'apellido', 'especialidad'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const informesParaIA = informesPrevios.map(i => ({
      tipo: i.tipo,
      autor: `${i.autor.nombre} ${i.autor.apellido} (${i.autor.especialidad || 'profesional'})`,
      texto: i.textoExtraido || i.contenidoManual || '',
    })).filter(i => i.texto);

    const { contenido, sinApiKey } = await adaptarTarea({
      paciente,
      tarea: { titulo: tarea.titulo, tipo: tarea.tipo, materia: tarea.materia, textoTarea },
      informesPrevios: informesParaIA,
    });

    await tarea.update({ tareaAdaptada: contenido, adaptadaAt: new Date() });

    res.json({ tarea, sinApiKey });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Eliminar tarea
router.delete('/:id', async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    await tarea.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
