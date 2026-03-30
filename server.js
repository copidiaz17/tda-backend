import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { sequelize } from './models/index.js';

import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import pacientesRoutes from './routes/pacientes.js';
import curriculasRoutes from './routes/curriculas.js';
import informesRoutes from './routes/informes.js';
import tareasRoutes from './routes/tareas.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

// Crear directorios de uploads si no existen
['uploads', 'uploads/curriculas', 'uploads/informes', 'uploads/tareas'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/curriculas', curriculasRoutes);
app.use('/api/informes', informesRoutes);
app.use('/api/tareas', tareasRoutes);

// Servir archivos subidos
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos sincronizada');
  app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
}).catch(e => {
  console.error('Error al conectar la base de datos:', e.message);
  process.exit(1);
});
