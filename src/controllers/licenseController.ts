import { Request, Response, NextFunction } from 'express';
import licenseService from '../services/license.service';
import { ValidateLicenseRequest, UseLicenseRequest } from '../types/license.types';

class LicenseController {
    async validateCreditLicense(req: Request, res: Response, _: NextFunction): Promise<void> {
        try {
            const { codigo, monto, deviceId }: ValidateLicenseRequest = req.body;
            
            const result = await licenseService.validateCreditLicense(codigo, monto, deviceId);
            
            res.json({
                isValid: true,
                message: 'Licencia válida',
                monto: result.monto
            });
        } catch (error) {
            res.json({
                isValid: false,
                message: (error as Error).message
            });
        }
    }

    async useLicense(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { codigo, deviceId }: UseLicenseRequest = req.body;
            
            await licenseService.useLicense(codigo, deviceId);
            
            res.json({
                success: true,
                message: 'Licencia utilizada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new LicenseController();