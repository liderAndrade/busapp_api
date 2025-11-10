import pool from '../config/database';
import { withTransaction } from '../utils/transaction';
import mysql from 'mysql2/promise';
import { TransactionType, TransactionResponse } from '../types/transaction.types';

class TransactionService {
    async registerTransaction(
        deviceId: string,
        tipo: TransactionType,
        monto: number,
        codigoLicencia: string | null = null,
        tripId: string | null = null
    ): Promise<number> {
        return await withTransaction(async (connection) => {
            // 1. Verificar que el dispositivo esté registrado
            const [dispositivo] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT * FROM dispositivos WHERE device_id = ? AND activo = 1',
                [deviceId]
            );
            
            if (dispositivo.length === 0) {
                throw new Error('Dispositivo no registrado');
            }

            // 2. Si es una compra (PURCHASE), verificar que la licencia esté marcada como usada
            if (tipo === 'PURCHASE' && codigoLicencia) {
                const [licencia] = await connection.execute<mysql.RowDataPacket[]>(
                    'SELECT * FROM licencias WHERE codigo = ? AND estado = 1',
                    [codigoLicencia]
                );
                
                if (licencia.length === 0) {
                    throw new Error('La licencia no ha sido validada previamente');
                }
            }

            // 3. Si es consumo (CONSUMPTION), verificar y descontar balance
            if (tipo === 'CONSUMPTION') {
                // Verificar balance disponible (con lock para evitar condiciones de carrera)
                const [balance] = await connection.execute<mysql.RowDataPacket[]>(
                    'SELECT balance FROM credit_balance WHERE device_id = ? FOR UPDATE',
                    [deviceId]
                );
                
                if (balance.length === 0) {
                    // Si no existe balance, crear uno en 0
                    await connection.execute(
                        'INSERT INTO credit_balance (device_id, balance, lastUpdated) VALUES (?, 0, NOW())',
                        [deviceId]
                    );
                } else if (balance[0].balance < monto) {
                    throw new Error('Créditos insuficientes');
                }

                // Descontar créditos
                await connection.execute(
                    'UPDATE credit_balance SET balance = balance - ?, lastUpdated = NOW() WHERE device_id = ?',
                    [monto, deviceId]
                );
            }

            // 4. Si es compra (PURCHASE), aumentar balance
            if (tipo === 'PURCHASE') {
                // Verificar si existe balance
                const [balance] = await connection.execute<mysql.RowDataPacket[]>(
                    'SELECT balance FROM credit_balance WHERE device_id = ? FOR UPDATE',
                    [deviceId]
                );
                
                if (balance.length === 0) {
                    // Si no existe, crear uno con el monto
                    await connection.execute(
                        'INSERT INTO credit_balance (device_id, balance, lastUpdated) VALUES (?, ?, NOW())',
                        [deviceId, monto]
                    );
                } else {
                    // Si existe, aumentar balance
                    await connection.execute(
                        'UPDATE credit_balance SET balance = balance + ?, lastUpdated = NOW() WHERE device_id = ?',
                        [monto, deviceId]
                    );
                }
            }

            // 5. Registrar la transacción
            const [result] = await connection.execute<mysql.ResultSetHeader>(
                `INSERT INTO transacciones 
                 (device_id, tipo, monto, codigo_licencia, trip_id, estado) 
                 VALUES (?, ?, ?, ?, ?, 'VALIDATED')`,
                [deviceId, tipo, monto, codigoLicencia, tripId]
            );

            return result.insertId;
        });
    }

    async getDeviceTransactions(deviceId: string): Promise<TransactionResponse[]> {
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            `SELECT * FROM transacciones 
             WHERE device_id = ? 
             ORDER BY fecha_transaccion DESC`,
            [deviceId]
        );
        
        return rows.map(row => ({
            id: row.id,
            tipo: row.tipo as TransactionType,
            monto: parseFloat(row.monto.toString()),
            codigoLicencia: row.codigo_licencia,
            tripId: row.trip_id,
            fechaTransaccion: row.fecha_transaccion,
            estado: row.estado as 'VALIDATED' | 'FAILED'
        }));
    }
}

export default new TransactionService();