import { Request, Response, NextFunction } from 'express';
import licenseService from '../services/license.service';
import { LicenseType, LicenseStatus } from '../types/license.types';

class AdminController {
    async generateLicense(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tipo, monto } = req.body;
            
            const licencia = await licenseService.generateLicense(tipo, monto);
            
            res.json({
                success: true,
                message: 'Licencia generada exitosamente',
                licencia
            });
        } catch (error) {
            next(error);
        }
    }

    async listLicenses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tipo, estado } = req.query;
            const filters: { tipo?: LicenseType; estado?: LicenseStatus } = {};
            
            if (tipo) filters.tipo = tipo as LicenseType;
            if (estado !== undefined) filters.estado = parseInt(estado as string) as LicenseStatus;
            
            const licencias = await licenseService.listLicenses(filters);
            res.json({ licencias });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();