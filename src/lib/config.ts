/**
 * Configuración centralizada del cliente.
 * La URL del API vive en la variable de entorno NEXT_PUBLIC_API_URL
 * (ver .env.local / .env.example). No hardcodear la URL en otros archivos.
 */
export const API = process.env.NEXT_PUBLIC_API_URL!;
