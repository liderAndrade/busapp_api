import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler';

// Importar rutas
import deviceRoutes from './routes/devicesRoutes';
import licenseRoutes from './routes/licenseRoutes';
import transactionRoutes from './routes/transactionRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/device', deviceRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/api/health', (_: Request, res: Response): void => {
    res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Manejo de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use((_: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

app.listen(PORT, (): void => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});