import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';

import usuarioRouter from "./routes/usuario.js";
import loginRouter from "./routes/login.js";
import proveedorRouter from "./routes/proveedor.js";
import loteRouter from "./routes/lote.js";
import productoRouter from "./routes/producto.js";
import inventarioRouter from "./routes/inventario.js";
import facturaRouter from "./routes/factura.js";
import facturasalidaRouter from "./routes/facturasalida.js";
import informeRouter from "./routes/informe.js";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => res.send('Hola Mundo'));

// Mount routers: cada colección tiene su propio archivo en `routes/`
app.use('/api/usuario', usuarioRouter);
app.use('/api/login', loginRouter);
app.use('/api/proveedor', proveedorRouter);
app.use('/api/lote', loteRouter);
app.use('/api/producto', productoRouter);
app.use('/api/inventario', inventarioRouter);
app.use('/api/factura', facturaRouter);
app.use('/api/facturasalida', facturasalidaRouter);
app.use('/api/informe', informeRouter);

const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

server.on('error', (err) => {
	if (err && err.code === 'EADDRINUSE') {
		console.error(`Port ${PORT} already in use. Stop the process using the port or set a different PORT.`);
		process.exit(1);
	}
	console.error('Server error:', err);
});