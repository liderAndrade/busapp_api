export interface DeviceInfo {
    deviceId: string;
    numeroIdentificacion: string;
    nombresCompletos: string;
    fechaRegistro: Date;
}

export interface ValidateDeviceResponse {
    exists: boolean;
    deviceInfo: DeviceInfo | null;
}

export interface RegisterDeviceRequest {
    deviceId: string;
    numeroIdentificacion: string;
    nombresCompletos: string;
    codigoLicencia: string;
}

export interface RegisterDeviceResponse {
    success: boolean;
    message: string;
    deviceInfo: DeviceInfo;
}