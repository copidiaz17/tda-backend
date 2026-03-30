import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

    const usuario = await Usuario.findOne({ where: { email, activo: true } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, especialidad: usuario.especialidad, nombre: usuario.nombre, apellido: usuario.apellido },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol, especialidad: usuario.especialidad } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  const u = await Usuario.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
  res.json(u);
});

export default router;
