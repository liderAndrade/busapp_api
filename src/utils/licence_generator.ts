import { customAlphabet } from "nanoid";

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusión
const nanoid = customAlphabet(alphabet, 12); // 12 caracteres

export function generarCodigoLicencia(): string {
    // Genera código de 12 caracteres: XXXX-XXXX-XXXX
    const codigo = nanoid();
    
    // Formatear con guiones: XXXX-XXXX-XXXX
    return `${codigo.slice(0, 4)}-${codigo.slice(4, 8)}-${codigo.slice(8, 12)}`;
}