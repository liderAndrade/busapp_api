import pool from '../config/database';
import { withTransaction } from '../utils/transaction';
import mysql from 'mysql2/promise';
import { DeviceInfo, ValidateDeviceResponse } from '../types/device.types';
import { ConflictError } from '../utils/AppError';

class DeviceService {
    async validateDevice(deviceId: string): Promise<ValidateDeviceResponse> {
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            'SELECT * FROM dispositivos WHERE device_id = ? AND activo = 1',
            [deviceId]
        );
        
        if (rows.length === 0) {
            return {
                exists: false,
                deviceInfo: null
            };
        }
        
        const device = rows[0];
        return {
            exists: true,
            deviceInfo: {
                deviceId: device.device_id,
                numeroIdentificacion: device.numero_identificacion,
                nombresCompletos: device.nombres_completos,
                fechaRegistro: device.fecha_registro
            }
        };
    }

    async registerDevice(
        deviceId: string,
        numeroIdentificacion: string,
        nombresCompletos: string,
        codigoLicencia: string
    ): Promise<DeviceInfo> {
        return await withTransaction(async (connection) => {
            // 1. Validar campos requeridos
            if (!deviceId || !numeroIdentificacion || !nombresCompletos || !codigoLicencia) {
                throw new Error('Todos los campos son requeridos');
            }

            // 2. Verificar que el dispositivo no esté ya registrado
            const [existing] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT id FROM dispositivos WHERE device_id = ?',
                [deviceId]
            );
            
            if (existing.length > 0) {
                throw new ConflictError('Este dispositivo ya está registrado');
            }

            // 3. Validar licencia de registro
            const [licencia] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT * FROM licencias WHERE codigo = ? AND tipo = "REGISTRO" AND estado = 0',
                [codigoLicencia]
            );
            
            if (licencia.length === 0) {
                throw new ConflictError('Licencia de registro inválida o ya utilizada');
            }

            // 4. Registrar el dispositivo
            await connection.execute(
                'INSERT INTO dispositivos (device_id, numero_identificacion, nombres_completos) VALUES (?, ?, ?)',
                [deviceId, numeroIdentificacion, nombresCompletos]
            );

            // 5. Marcar la licencia como usada
            await connection.execute(
                'UPDATE licencias SET estado = 1, fecha_uso = NOW(), device_id = ? WHERE codigo = ?',
                [deviceId, codigoLicencia]
            );

            return {
                deviceId,
                numeroIdentificacion,
                nombresCompletos,
                fechaRegistro: new Date()
            };
        });
    }
}

export default new DeviceService();