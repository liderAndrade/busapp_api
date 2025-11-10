export type TransactionType = 'PURCHASE' | 'CONSUMPTION' | 'REFUND';
export type TransactionStatus = 'VALIDATED' | 'FAILED';

export interface RegisterTransactionRequest {
    deviceId: string;
    tipo: TransactionType;
    monto: number;
    codigoLicencia?: string;
    tripId?: string;
}

export interface RegisterTransactionResponse {
    success: boolean;
    transactionId: number;
    message: string;
}

export interface TransactionResponse {
    id: number;
    tipo: TransactionType;
    monto: number;
    codigoLicencia: string | null;
    tripId: string | null;
    fechaTransaccion: Date;
    estado: TransactionStatus;
}

export interface GetTransactionsResponse {
    transactions: TransactionResponse[];
}