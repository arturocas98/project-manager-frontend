// local-storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private readonly PREFIX = 'app_'; // opcional
    private isLoggingEnabled = true; // Control para habilitar/deshabilitar logs

    constructor() {
        this.initializeStorage();
    }

    /**
     * Inicializa el almacenamiento local
     */
    private initializeStorage(): void {
        // Verificar si localStorage está disponible
        if (!this.isLocalStorageAvailable()) {
            console.error('localStorage no está disponible en este navegador');
        }
    }

    /**
     * Verifica si localStorage está disponible
     */
    private isLocalStorageAvailable(): boolean {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Almacena un valor en localStorage
     * @param key - Clave para almacenar
     * @param value - Valor a almacenar (puede ser cualquier tipo)
     */
    setValueToLocal(key: string, value: any): void {
        const fullKey = this.getFullKey(key);
        const stringValue = this.stringifyValue(value);

        if (this.isLoggingEnabled) {
            console.log(`setValueToLocal: ${typeof value} - ${fullKey} - ${stringValue}`);
        }

        try {
            localStorage.setItem(fullKey, stringValue);
        } catch (error) {
            console.error(`Error al guardar en localStorage (key: ${fullKey}):`, error);
            throw new Error('No se pudo guardar el valor en el almacenamiento local');
        }
    }

    /**
     * Obtiene un valor de localStorage
     * @param key - Clave a recuperar
     * @returns Valor tipado
     */
    getValueFromLocal<T>(key: string): T | null {
        const fullKey = this.getFullKey(key);
        const rawValue = localStorage.getItem(fullKey);

        if (this.isLoggingEnabled) {
            console.log(`getValueFromLocal: ${typeof rawValue} - ${fullKey} - ${rawValue}`);
        }

        if (rawValue === null) {
            return null;
        }

        return this.parseValue<T>(rawValue);
    }

    /**
     * Obtiene un valor de localStorage con valor por defecto
     * @param key - Clave a recuperar
     * @param defaultValue - Valor por defecto si no existe
     * @returns Valor tipado o el valor por defecto
     */
    getValueFromLocalWithDefault<T>(key: string, defaultValue: T): T {
        const value = this.getValueFromLocal<T>(key);
        return value !== null ? value : defaultValue;
    }

    /**
     * Elimina un valor de localStorage
     * @param key - Clave a eliminar
     */
    removeValueFromLocal(key: string): void {
        const fullKey = this.getFullKey(key);

        if (this.isLoggingEnabled) {
            console.log(`removeValueFromLocal: ${fullKey}`);
        }

        localStorage.removeItem(fullKey);
    }

    /**
     * Obtiene un valor booleano de localStorage con valor por defecto
     * Similar a getBoolAsync de Flutter
     * @param key - Clave a recuperar
     * @param defaultValue - Valor por defecto si no existe (por defecto false)
     * @returns Valor booleano
     */
    getBoolAsync(key: string, defaultValue: boolean = false): boolean {
        const value = this.getValueFromLocal<any>(key);

        if (value === null || value === undefined) {
            return defaultValue;
        }

        // Convertir varios tipos a booleano
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            return lowerValue === 'true' || lowerValue === '1';
        }

        if (typeof value === 'number') {
            return value !== 0;
        }

        return defaultValue;
    }

    /**
     * Limpia todo el almacenamiento local
     * @param includePrefixed - Si incluir solo las claves con prefijo
     */
    clearAll(includePrefixed: boolean = false): void {
        if (includePrefixed) {
            // Eliminar solo las claves con prefijo
            const keysToRemove: string[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.PREFIX)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));
        } else {
            // Eliminar todo
            localStorage.clear();
        }
    }

    /**
     * Verifica si una clave existe en localStorage
     * @param key - Clave a verificar
     * @returns true si existe
     */
    hasKey(key: string): boolean {
        const fullKey = this.getFullKey(key);
        return localStorage.getItem(fullKey) !== null;
    }

    /**
     * Obtiene todas las claves almacenadas
     * @param withPrefix - Si incluir solo las claves con prefijo
     * @returns Array de claves
     */
    getAllKeys(withPrefix: boolean = false): string[] {
        const keys: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                if (!withPrefix || key.startsWith(this.PREFIX)) {
                    // Remover prefijo si se solicita
                    const displayKey = withPrefix ? key.substring(this.PREFIX.length) : key;
                    keys.push(displayKey);
                }
            }
        }

        return keys;
    }

    /**
     * Habilita o deshabilita los logs
     * @param enabled - Estado de los logs
     */
    setLoggingEnabled(enabled: boolean): void {
        this.isLoggingEnabled = enabled;
    }

    /**
     * Obtiene el número de elementos almacenados
     * @param withPrefix - Si contar solo las claves con prefijo
     * @returns Número de elementos
     */
    getItemCount(withPrefix: boolean = false): number {
        if (!withPrefix) {
            return localStorage.length;
        }

        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.PREFIX)) {
                count++;
            }
        }

        return count;
    }

    // Métodos privados auxiliares

    private getFullKey(key: string): string {
        return `${this.PREFIX}${key}`;
    }

    private stringifyValue(value: any): string {
        try {
            // Para valores primitivos que no necesitan JSON.stringify
            if (value === null || value === undefined) {
                return String(value);
            }

            // Para números, booleanos y strings, almacenar como están
            if (typeof value === 'number' || typeof value === 'boolean') {
                return value.toString();
            }

            // Para strings, almacenar directamente
            if (typeof value === 'string') {
                return value;
            }

            // Para objetos y arrays, usar JSON.stringify
            return JSON.stringify(value);
        } catch (error) {
            console.error('Error al convertir valor a string:', error);
            return String(value);
        }
    }

    private parseValue<T>(value: string): T {
        try {
            // Intentar parsear como JSON
            return JSON.parse(value) as T;
        } catch (error) {
            // Si no es JSON válido, intentar otros tipos
            if (value === 'true' || value === 'false') {
                return (value === 'true') as unknown as T;
            }

            if (!isNaN(Number(value)) && value.trim() !== '') {
                return Number(value) as unknown as T;
            }

            // Por defecto, devolver como string
            return value as unknown as T;
        }
    }
}

// Constantes para claves comunes (opcional)
export const SharedPreferenceConst = {
    USER_PASSWORD: 'USER_PASSWORD',
    USER_JSON_WEB_TOKEN: 'User_Json_Web_Token',
    IS_LOGGED_IN: 'isLoggedIn',
    USER_EMAIL: 'user_email',
    USER_ID: 'user_id',
    SELECTED_LANGUAGE: 'selected_language',
    THEME_MODE: 'theme_mode',
    NOTIFICATIONS_ENABLED: 'notifications_enabled'
} as const;