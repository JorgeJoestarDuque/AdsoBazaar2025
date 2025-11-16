import express from "express";
import bodyParser from "body-parser";

import usuarioRouter from "./routes/usuario.js";
import proveedorRouter from "./routes/proveedor.js";
import loteRouter from "./routes/lote.js";
import productoRouter from "./routes/producto.js";
import inventarioRouter from "./routes/inventario.js";
import facturaRouter from "./routes/factura.js";
import facturasalidaRouter from "./routes/facturasalida.js";
import informeRouter from "./routes/informe.js";

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hola Mundo'));

// Mount routers: cada colección tiene su propio archivo en `routes/`
app.use('/api/usuario', usuarioRouter);
app.use('/api/proveedor', proveedorRouter);
app.use('/api/lote', loteRouter);
app.use('/api/producto', productoRouter);
app.use('/api/inventario', inventarioRouter);
app.use('/api/factura', facturaRouter);
app.use('/api/facturasalida', facturasalidaRouter);
app.use('/api/informe', informeRouter);

app.listen(10000)