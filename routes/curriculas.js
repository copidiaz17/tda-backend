import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { Curricula, Adaptacion, Paciente, Informe, Usuario } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { extraerTexto } from '../utils/fileParser.js';
import { generarAdaptacion } from '../utils/ia.js';

const router = Router();
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: 'uploads/curriculas/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Subir currícula
router.post('/', upload.single('archivo'), async (req, res) => {
  try {
    const { pacienteId, nombre, materia, anioEscolar } = req.body;
    if (!pacienteId || !nombre) return res.status(400).json({ error: 'Faltan campos obligatorios' });

    let textoExtraido = null;
    let archivoNombre = 'sin-archivo';
    let archivoPath = '';

    if (req.file) {
      archivoNombre = req.file.originalname;
      archivoPath = req.file.path;
      textoExtraido = await extraerTexto(req.file.path, req.file.originalname);
    } else if (req.body.textoManual) {
      textoExtraido = req.body.textoManual;
      archivoNombre = 'ingreso-manual.txt';
      archivoPath = '';
    } else {
      return res.status(400).json({ error: 'Debés subir un archivo o ingresar texto' });
    }

    const curricula = await Curricula.create({
      pacienteId, nombre, materia, anioEscolar,
      archivoNombre, archivoPath,
      textoExtraido,
      subidoPorId: req.user.id,
    });

    res.status(201).json(curricula);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generar adaptación IA para una currícula
router.post('/:id/adaptar', async (req, res) => {
  try {
    const curricula = await Curricula.findByPk(req.params.id);
    if (!curricula) return res.status(404).json({ error: 'Currícula no encontrada' });
    if (!curricula.textoExtraido) return res.status(400).json({ error: 'La currícula no tiene texto extraído' });

    const paciente = await Paciente.findByPk(curricula.pacienteId);

    // Obtener informes previos del paciente
    const informesPrevios = await Informe.findAll({
      where: { pacienteId: paciente.id },
      include: [{ model: Usuario, as: 'autor', attributes: ['nombre', 'apellido', 'especialidad'] }],
      order: [['createdAt', 'DESC']],
    });

    const informesParaIA = informesPrevios.map(i => ({
      tipo: i.tipo,
      autor: `${i.autor.nombre} ${i.autor.apellido} (${i.autor.especialidad || 'profesional'})`,
      texto: i.textoExtraido || i.contenidoManual || '',
    })).filter(i => i.texto);

    const { contenido, sinApiKey } = await generarAdaptacion({
      paciente,
      textoCurricula: curricula.textoExtraido,
      informesPrevios: informesParaIA,
    });

    // Desactivar adaptaciones previas de esta currícula
    await Adaptacion.update({ activa: false }, { where: { curriculaId: curricula.id } });

    // Calcular versión
    const ultima = await Adaptacion.findOne({
      where: { curriculaId: curricula.id },
      order: [['version', 'DESC']],
    });
    const version = ultima ? ultima.version + 1 : 1;

    const adaptacion = await Adaptacion.create({
      pacienteId: paciente.id,
      curriculaId: curricula.id,
      version,
      contenido,
      motivoActualizacion: 'Generación inicial',
      activa: true,
    });

    res.json({ adaptacion, sinApiKey });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Obtener adaptación activa de una currícula
router.get('/:id/adaptacion', async (req, res) => {
  try {
    const adaptacion = await Adaptacion.findOne({
      where: { curriculaId: req.params.id, activa: true },
      order: [['version', 'DESC']],
    });
    res.json(adaptacion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Historial de adaptaciones de una currícula
router.get('/:id/historial', async (req, res) => {
  try {
    const adaptaciones = await Adaptacion.findAll({
      where: { curriculaId: req.params.id },
      order: [['version', 'DESC']],
    });
    res.json(adaptaciones);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
