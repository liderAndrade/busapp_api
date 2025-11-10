import { Request, Response, NextFunction } from 'express';
import transactionService from '../services/transaction.service';
import { RegisterTransactionRequest } from '../types/transaction.types';

class TransactionController {
    async registerTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { deviceId, tipo, monto, codigoLicencia, tripId }: RegisterTransactionRequest = req.body;
            
            const transactionId = await transactionService.registerTransaction(
                deviceId,
                tipo,
                monto,
                codigoLicencia,
                tripId
            );

            res.json({
                success: true,
                transactionId,
                message: 'Transacción registrada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }

    async getDeviceTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { deviceId } = req.params;
            const transactions = await transactionService.getDeviceTransactions(deviceId);
            res.json({ transactions });
        } catch (error) {
            next(error);
        }
    }
}

export default new TransactionController();