import { jwtDecode } from "jwt-decode";

export const getEmail = (): string | null => {
    const token = localStorage.getItem('Token');
    if (!token) return null;

    try {
        const decoded = jwtDecode<{ preferred_username ?: string }>(token);
        return decoded?.preferred_username ?? null;
    } catch {
        return null;
    }
}