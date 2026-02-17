// error.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TimedModalService, ModalConfig } from './Modals/timed-modal.service';

export interface ValidationModal {
    message: string;
    color: string;
    backgroundColor: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorService {

    // Mensajes de error genéricos
    private readonly errorMessages = {
        internetNotAvailable: 'Internet not available',
        somethingWentWrong: 'Something went wrong',
        badRequest: 'Bad Request',
        loginError: 'Login Error',
        forbidden: 'Forbidden',
        pageNotFound: 'Page Not Found',
        tooManyRequests: 'Too Many Requests',
        internalServerError: 'Internal Server Error',
        badGateway: 'Bad Gateway',
        serviceUnavailable: 'Service Unavailable',
        gatewayTimeout: 'Gateway Timeout'
    };

    constructor(private modalService: TimedModalService) {}

    /**
     * Mapea errores HTTP a mensajes específicos
     */
    mapError(statusCode: number, body: any = null): string {
        let errorMessage = this.errorMessages.somethingWentWrong;

        switch (statusCode) {
            case 400:
                errorMessage = this.errorMessages.badRequest;
                break;
            case 401:
                errorMessage = `${this.errorMessages.loginError} ${body ? JSON.stringify(body) : ''}`;
                break;
            case 403:
                errorMessage = this.errorMessages.forbidden;
                break;
            case 404:
                errorMessage = this.errorMessages.pageNotFound;
                break;
            case 422:
                errorMessage = this.getFirstValidationError(body);
                break;
            case 429:
                errorMessage = this.errorMessages.tooManyRequests;
                break;
            case 500:
                errorMessage = this.errorMessages.internalServerError;
                break;
            case 502:
                errorMessage = this.errorMessages.badGateway;
                break;
            case 503:
                errorMessage = this.errorMessages.serviceUnavailable;
                break;
            case 504:
                errorMessage = this.errorMessages.gatewayTimeout;
                break;
            default:
                if (body?.message) {
                    errorMessage = body.message;
                }
                break;
        }

        return errorMessage;
    }

    /**
     * Obtiene el primer error de validación de una respuesta 422
     */
    private getFirstValidationError(body: any): string {
        if (!body) return 'Validation Error';

        // Diferentes formatos de errores de validación
        if (body.errors && Array.isArray(body.errors) && body.errors.length > 0) {
            return body.errors[0];
        }

        if (body.error && typeof body.error === 'string') {
            return body.error;
        }

        if (body.message) {
            return body.message;
        }

        return 'Validation Error';
    }

    /**
     * Maneja y muestra errores
     */
    handleError(error: any): void {
        console.error('Error handled:', error);

        if (error instanceof HttpErrorResponse) {
            const message = this.mapError(error.status, error.error);
            this.showModal(message, this.getModalType(error.status), error.status.toString());
        } else if (error.message) {
            this.showModal(error.message, 'error', '400');
        } else {
            this.showModal(this.errorMessages.somethingWentWrong, 'error', '500');
        }
    }

    /**
     * Muestra un modal con el error
     */
    showModal(
        message: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'error',
        statusCode: string = '400',
        title?: string,
        autoCloseTime?: number
    ): void {

        const modalConfig: ModalConfig = {
            statusCode,
            message,
            type,
            title: title || this.getDefaultTitle(type),
            autoCloseTime: autoCloseTime || this.getDefaultAutoCloseTime(type),
            showCloseButton: true
        };

        this.modalService.showModal(modalConfig);
    }

    /**
     * Muestra un modal personalizado similar a Flutter
     */
    showValidationModal(config: Partial<ValidationModal>): void {
        const defaultConfig: ValidationModal = {
            message: 'An error occurred',
            color: '#ffffff',
            backgroundColor: '#f44336',
            icon: 'error'
        };

        const finalConfig = { ...defaultConfig, ...config };

        this.showModal(finalConfig.message, 'error', '400');
    }

    /**
     * Muestra un modal basado en código de estado HTTP
     */
    showModalByStatusCode(statusCode: number, customMessage?: string): void {
        const message = customMessage || this.mapError(statusCode);
        const type = this.getModalType(statusCode);

        this.modalService.showModalByStatusCode(
            statusCode.toString(),
            customMessage || message
        );
    }

    /**
     * Muestra un modal de éxito
     */
    showSuccess(message: string, title?: string): void {
        this.modalService.showSuccess(message, title);
    }

    /**
     * Muestra un modal de error
     */
    showError(message: string, title?: string): void {
        this.modalService.showError(message, title);
    }

    /**
     * Determina el tipo de modal basado en el código de estado
     */
    private getModalType(statusCode: number): 'success' | 'error' | 'warning' | 'info' {
        if (statusCode >= 200 && statusCode < 300) {
            return 'success';
        } else if (statusCode >= 400 && statusCode < 500) {
            return 'error';
        } else if (statusCode >= 500) {
            return 'error';
        } else {
            return 'info';
        }
    }

    /**
     * Obtiene título por defecto basado en el tipo
     */
    private getDefaultTitle(type: 'success' | 'error' | 'warning' | 'info'): string {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type];
    }

    /**
     * Obtiene tiempo de cierre automático por defecto
     */
    private getDefaultAutoCloseTime(type: 'success' | 'error' | 'warning' | 'info'): number {
        const times = {
            success: 3000,    // 3 segundos
            error: 5000,      // 5 segundos
            warning: 4000,    // 4 segundos
            info: 3000        // 3 segundos
        };
        return times[type];
    }

    /**
     * Verifica si hay conexión a internet
     */
    isNetworkAvailable(): Promise<boolean> {
        return new Promise((resolve) => {
            if (typeof navigator !== 'undefined' && navigator.onLine !== undefined) {
                resolve(navigator.onLine);
            } else {
                // Fallback para entornos donde navigator.onLine no está disponible
                resolve(true);
            }
        });
    }

    /**
     * Manejo específico para errores de red
     */
    handleNetworkError(error: any): void {
        if (!navigator.onLine) {
            this.showModal(
                this.errorMessages.internetNotAvailable,
                'error',
                'NETWORK_ERROR',
                'Network Error'
            );
        } else if (error.name === 'TimeoutError') {
            this.showModal(
                'Request timeout. Please try again.',
                'warning',
                'TIMEOUT',
                'Request Timeout',
                4000
            );
        } else {
            this.handleError(error);
        }
    }

    /**
     * Obtiene mensajes de error localizados
     */
    getErrorMessage(key: keyof typeof this.errorMessages): string {
        return this.errorMessages[key] || this.errorMessages.somethingWentWrong;
    }

    /**
     * Cierra todos los modales abiertos
     */
    closeAllModals(): void {
        this.modalService.hideModal();
    }

    /**
     * Método específico para errores de login
     */
    handleLoginError(error: any): void {
        if (error.status === 401) {
            this.showModal(
                'Invalid email or password. Please try again.',
                'error',
                '401',
                'Login Failed',
                5000
            );
        } else {
            this.handleError(error);
        }
    }

    /**
     * Método específico para errores de validación de formularios
     */
    handleValidationError(errors: string[]): void {
        if (errors && errors.length > 0) {
            const errorMessage = errors.join('\n');
            this.showModal(
                errorMessage,
                'error',
                '422',
                'Validation Error',
                5000
            );
        }
    }

    /**
     * Método para mostrar mensajes de éxito de operaciones comunes
     */
    showOperationSuccess(operation: string): void {
        const messages = {
            login: 'Login successful!',
            register: 'Registration successful!',
            update: 'Update successful!',
            delete: 'Delete successful!',
            save: 'Save successful!',
            create: 'Create successful!'
        };

        const message = messages[operation as keyof typeof messages] || 'Operation completed successfully';
        this.showSuccess(message);
    }
}