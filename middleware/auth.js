import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token expirado o inválido' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Se requiere rol admin' });
  next();
}
