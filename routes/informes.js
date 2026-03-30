import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { Informe, Adaptacion, Paciente, Curricula, Usuario } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { extraerTexto } from '../utils/fileParser.js';
import { actualizarAdaptacionConInforme } from '../utils/ia.js';

const router = Router();
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: 'uploads/informes/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Subir informe
router.post('/', upload.single('archivo'), async (req, res) => {
  try {
    const { pacienteId, tipo, titulo, contenidoManual } = req.body;
    if (!pacienteId || !tipo || !titulo) return res.status(400).json({ error: 'Faltan campos obligatorios' });

    let textoExtraido = null;
    let archivoNombre = null;
    let archivoPath = null;

    if (req.file) {
      archivoNombre = req.file.originalname;
      archivoPath = req.file.path;
      textoExtraido = await extraerTexto(req.file.path, req.file.originalname);
    }

    const informe = await Informe.create({
      pacienteId, tipo, titulo,
      archivoNombre, archivoPath,
      textoExtraido,
      contenidoManual,
      autorId: req.user.id,
      incorporadoEnAdaptacion: false,
    });

    res.status(201).json(informe);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Incorporar informe en la adaptación curricular (actualizar con IA)
router.post('/:id/incorporar', async (req, res) => {
  try {
    const informe = await Informe.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'autor', attributes: ['nombre', 'apellido', 'especialidad'] }],
    });
    if (!informe) return res.status(404).json({ error: 'Informe no encontrado' });

    const textoInforme = informe.textoExtraido || informe.contenidoManual;
    if (!textoInforme) return res.status(400).json({ error: 'El informe no tiene contenido de texto' });

    const { curriculaId } = req.body;
    if (!curriculaId) return res.status(400).json({ error: 'Debe especificarse curriculaId' });

    const curricula = await Curricula.findByPk(curriculaId);
    if (!curricula) return res.status(404).json({ error: 'Currícula no encontrada' });

    // Obtener adaptación activa
    const adaptacionActual = await Adaptacion.findOne({
      where: { curriculaId, activa: true },
      order: [['version', 'DESC']],
    });
    if (!adaptacionActual) return res.status(400).json({ error: 'No hay adaptación activa para esta currícula. Generá una primero.' });

    const paciente = await Paciente.findByPk(informe.pacienteId);

    const { contenido, sinApiKey } = await actualizarAdaptacionConInforme({
      paciente,
      adaptacionActual: adaptacionActual.contenido,
      informe: {
        tipo: informe.tipo,
        autor: `${informe.autor.nombre} ${informe.autor.apellido} (${informe.autor.especialidad || 'profesional'})`,
        texto: textoInforme,
      },
    });

    // Desactivar versión anterior
    await adaptacionActual.update({ activa: false });

    const nuevaAdaptacion = await Adaptacion.create({
      pacienteId: informe.pacienteId,
      curriculaId,
      version: adaptacionActual.version + 1,
      contenido,
      motivoActualizacion: `Actualización por informe: ${informe.titulo}`,
      informeBaseId: informe.id,
      activa: true,
    });

    await informe.update({ incorporadoEnAdaptacion: true });

    res.json({ adaptacion: nuevaAdaptacion, sinApiKey });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Listar informes de un paciente
router.get('/paciente/:pacienteId', async (req, res) => {
  try {
    const informes = await Informe.findAll({
      where: { pacienteId: req.params.pacienteId },
      include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'apellido', 'especialidad'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(informes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
