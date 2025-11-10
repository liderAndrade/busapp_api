import { Request, Response, NextFunction } from 'express';
import deviceService from '../services/device.service';
import { RegisterDeviceRequest } from '../types/device.types';

class DeviceController {
    async validateDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { deviceId } = req.params;
            const result = await deviceService.validateDevice(deviceId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async registerDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { deviceId, numeroIdentificacion, nombresCompletos, codigoLicencia }: RegisterDeviceRequest = req.body;
            
            const deviceInfo = await deviceService.registerDevice(
                deviceId,
                numeroIdentificacion,
                nombresCompletos,
                codigoLicencia
            );

            res.json({
                success: true,
                message: 'Dispositivo registrado exitosamente',
                deviceInfo
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DeviceController();