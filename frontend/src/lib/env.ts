/**
 * Environment variables helper
 * Provides centralized access to environment variables with fallback values
 */

export const env = {
    // Backend URL (for static assets like images)
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',

    // API URL (for API calls)
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
} as const;

/**
 * Get full URL for uploaded files
 * @param path - The file path (e.g., /uploads/logo.png)
 * @returns Full URL including backend domain
 */
export function getAssetUrl(path: string): string {
    if (!path) return '';

    // If path already includes http/https, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${env.BACKEND_URL}${normalizedPath}`;
}
