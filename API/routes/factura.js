import express from 'express';
import { readData, writeData } from './helpers.js';

const router = express.Router();
const COLL = 'factura';
const KEY = 'NumeroFactura';

router.get('/', (req, res) => res.json(readData()[COLL] || []));

router.get('/:id', (req, res) => {
  const data = readData();
  const id = req.params.id;
  const item = (data[COLL] || []).find((x) => String(x[KEY]) === id);
  if (!item) return res.status(404).json({ message: 'Factura no encontrada' });
  res.json(item);
});

router.post('/', (req, res) => {
  const data = readData();
  data[COLL] = data[COLL] || [];
  const newItem = req.body;
  if (newItem[KEY] == null) return res.status(400).json({ message: `${KEY} es requerido` });
  if (data[COLL].some((x) => String(x[KEY]) === String(newItem[KEY])))
    return res.status(400).json({ message: 'Factura ya existe' });
  data[COLL].push(newItem);
  writeData(data);
  res.status(201).json(newItem);
});

router.put('/:id', (req, res) => {
  const data = readData();
  const id = req.params.id;
  data[COLL] = data[COLL] || [];
  const idx = data[COLL].findIndex((x) => String(x[KEY]) === id);
  if (idx === -1) return res.status(404).json({ message: 'Factura no encontrada' });
  data[COLL][idx] = { ...data[COLL][idx], ...req.body };
  writeData(data);
  res.json(data[COLL][idx]);
});

router.delete('/:id', (req, res) => {
  const data = readData();
  const id = req.params.id;
  data[COLL] = data[COLL] || [];
  const idx = data[COLL].findIndex((x) => String(x[KEY]) === id);
  if (idx === -1) return res.status(404).json({ message: 'Factura no encontrada' });
  const removed = data[COLL].splice(idx, 1)[0];
  writeData(data);
  res.json(removed);
});

export default router;
