export type LicenseType = 'REGISTRO' | 'CREDITO';
export type LicenseStatus = 0 | 1;

export interface License {
    id: number;
    codigo: string;
    tipo: LicenseType;
    monto: number | null;
    estado: LicenseStatus;
    fecha_creacion: Date;
    fecha_uso: Date | null;
    device_id: string | null;
}

export interface ValidateLicenseRequest {
    codigo: string;
    monto: number;
    deviceId: string;
}

export interface ValidateLicenseResponse {
    isValid: boolean;
    message: string;
    monto?: number;
}

export interface UseLicenseRequest {
    codigo: string;
    deviceId: string;
}

export interface GenerateLicenseRequest {
    tipo: LicenseType;
    monto?: number;
}

export interface GeneratedLicense {
    codigo: string;
    tipo: LicenseType;
    monto: number | null;
}

export interface GenerateLicenseResponse {
    success: boolean;
    message: string;
    licencia: GeneratedLicense;
}

