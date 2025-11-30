import express from 'express';
import { readData } from './helpers.js';

const router = express.Router();

function removePasswordFields(user) {
  const copy = { ...user };
  delete copy.contrasena;
  delete copy.password;
  delete copy.Password;
  return copy;
}

// GET /api/login?email=...&password=...
router.get('/', (req, res) => {
  const { email, password } = req.query;
  if (!email || !password) return res.status(400).json({ success: false, message: 'email y password son requeridos en query' });

  const data = readData();
  const users = data.usuario || [];
  const user = users.find(u => (u.Email && u.Email === email) || (u.email && u.email === email) || (u.Nombre && u.Nombre === email));
  if (!user) return res.status(401).json({ success: false, message: 'Usuario no encontrado' });

  const pwd = user.Contrasena || user.contrasena || user.password || user.Password;
  if (!pwd) return res.status(400).json({ success: false, message: 'Usuario no tiene contraseña registrada' });

  if (String(pwd) !== String(password)) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

  return res.json({ success: true, usuario: removePasswordFields(user) });
});

// POST /api/login  with JSON { email, password }
router.post('/', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'email y password son requeridos' });

  const data = readData();
  const users = data.usuario || [];
  const user = users.find(u => (u.Email && u.Email === email) || (u.email && u.email === email) || (u.Nombre && u.Nombre === email));
  if (!user) return res.status(401).json({ success: false, message: 'Usuario no encontrado' });

  const pwd = user.contrasena || user.password || user.Password;
  if (!pwd) return res.status(400).json({ success: false, message: 'Usuario no tiene contraseña registrada' });

  if (String(pwd) !== String(password)) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

  return res.json({ success: true, usuario: removePasswordFields(user) });
});

export default router;
