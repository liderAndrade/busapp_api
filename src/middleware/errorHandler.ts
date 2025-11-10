import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export default function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Si es un AppError personalizado
    if (err instanceof AppError) {
        console.log(err)
        console.log(err.message)
         res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            statusCode: err.statusCode
        });
        return;
    }

    // Si es un error de validación de Express
    if (err.name === 'ValidationError') {
        res.status(400).json({
            status: 'error',
            message: err.message || 'Error de validación',
            statusCode: 400
        });
        return;
    }

    // Error desconocido
    console.error('Error no manejado:', err);

    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack 
        })
    });
}