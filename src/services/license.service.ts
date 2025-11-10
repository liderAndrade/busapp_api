import pool from '../config/database';
import { withTransaction } from '../utils/transaction';
import { generarCodigoLicencia } from '../utils/licence_generator';
import mysql from 'mysql2/promise';
import { LicenseType, LicenseStatus, GeneratedLicense } from '../types/license.types';

class LicenseService {
    async validateCreditLicense(
        codigo: string,
        monto: number,
        deviceId: string
    ): Promise<{ isValid: boolean; monto: number }> {
        if (!codigo || !monto || !deviceId) {
            throw new Error('Todos los campos son requeridos');
        }

        // Buscar la licencia disponible
        const [licencias] = await pool.execute<mysql.RowDataPacket[]>(
            'SELECT * FROM licencias WHERE codigo = ? AND tipo = "CREDITO" AND estado = 0',
            [codigo]
        );
        
        if (licencias.length === 0) {
            throw new Error('Licencia inválida o ya utilizada');
        }
        
        const licencia = licencias[0];
        
        // Validar que el monto coincida
        if (licencia.monto === null || parseFloat(licencia.monto.toString()) !== parseFloat(monto.toString())) {
            throw new Error(`El monto no coincide. La licencia es de $${licencia.monto}`);
        }
        
        // Verificar que el dispositivo esté registrado
        const [dispositivo] = await pool.execute<mysql.RowDataPacket[]>(
            'SELECT * FROM dispositivos WHERE device_id = ? AND activo = 1',
            [deviceId]
        );
        
        if (dispositivo.length === 0) {
            throw new Error('Dispositivo no registrado');
        }
        
        return {
            isValid: true,
            monto: licencia.monto
        };
    }

    async useLicense(codigo: string, deviceId: string): Promise<void> {
        return await withTransaction(async (connection) => {
            // Verificar que la licencia esté disponible (con lock para evitar condiciones de carrera)
            const [licencia] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT * FROM licencias WHERE codigo = ? AND estado = 0 FOR UPDATE',
                [codigo]
            );
            
            if (licencia.length === 0) {
                throw new Error('Licencia no disponible o ya utilizada');
            }

            // Marcar la licencia como usada
            const [result] = await connection.execute<mysql.ResultSetHeader>(
                'UPDATE licencias SET estado = 1, fecha_uso = NOW(), device_id = ? WHERE codigo = ? AND estado = 0',
                [deviceId, codigo]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('No se pudo usar la licencia');
            }
        });
    }

    async generateLicense(
        tipo: LicenseType,
        monto: number | null = null
    ): Promise<GeneratedLicense> {
        if (!tipo || (tipo === 'CREDITO' && !monto)) {
            throw new Error('Parámetros inválidos');
        }

        return await withTransaction(async (connection) => {
            let codigo: string | null = null;
            let intentos = 0;
            const maxIntentos = 100; // Evitar loops infinitos
            
            // Generar código único
            while (codigo === null && intentos < maxIntentos) {
                const codigoGenerado = generarCodigoLicencia();
                intentos++;
                
                // Verificar en base de datos si el código ya existe
                const [existing] = await connection.execute<mysql.RowDataPacket[]>(
                    'SELECT id FROM licencias WHERE codigo = ?',
                    [codigoGenerado]
                );
                
                if (existing.length === 0) {
                    // Código único encontrado
                    codigo = codigoGenerado;
                    break;
                }
            }
            
            // Verificar que se generó un código válido
            if (codigo === null) {
                throw new Error(`No se pudo generar código único después de ${maxIntentos} intentos`);
            }
            
            // Insertar licencia
            await connection.execute(
                'INSERT INTO licencias (codigo, tipo, monto) VALUES (?, ?, ?)',
                [codigo, tipo, monto]
            );
            
            return {
                codigo,
                tipo,
                monto: monto || null
            };
        });
    }

    async listLicenses(filters: { tipo?: LicenseType; estado?: LicenseStatus } = {}): Promise<any[]> {
        let query = 'SELECT * FROM licencias WHERE 1=1';
        const params: (LicenseType | LicenseStatus)[] = [];
        
        if (filters.tipo) {
            query += ' AND tipo = ?';
            params.push(filters.tipo);
        }
        
        if (filters.estado !== undefined) {
            query += ' AND estado = ?';
            params.push(filters.estado);
        }
        
        query += ' ORDER BY fecha_creacion DESC';
        
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(query, params);
        return rows;
    }
}

export default new LicenseService();