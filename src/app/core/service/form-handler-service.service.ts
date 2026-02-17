import { Injectable, inject } from '@angular/core';
import {TimedModalService} from "./Modals/timed-modal.service";

@Injectable({
    providedIn: 'root'
})
export class FormHandlerService {
    private modalService = inject(TimedModalService);

    /**
     * Maneja un código de estado y muestra el modal correspondiente
     */
    handleStatusCode(statusCode: string | number, customMessage?: string): void {
        console.log("statusCode", statusCode);
        console.log("customMessage", customMessage);
        const code = statusCode.toString();

        if (this.isSuccessStatus(code)) {
            console.log("true");
            this.showSuccessModal(code, customMessage);
        } else {
            console.log("false");
            this.showErrorModal(code, customMessage);
        }
    }

    /**
     * Maneja un código de estado de éxito
     */
    handleSuccess(statusCode: string | number, customMessage?: string): void {
        const code = statusCode.toString();
        this.showSuccessModal(code, customMessage);
    }

    /**
     * Maneja un código de estado de error
     */
    handleError(statusCode: string | number, customMessage?: string): void {
        const code = statusCode.toString();
        this.showErrorModal(code, customMessage);
    }

    /**
     * Determina si el status code es de éxito (200-299)
     */
    private isSuccessStatus(statusCode: string): boolean {
        const code = parseInt(statusCode);
        return code >= 200 && code < 300;
    }

    /**
     * Muestra modal de éxito según status code
     */
    private showSuccessModal(statusCode: string, customMessage?: string): void {
        const message = customMessage || this.getSuccessMessage(statusCode);

        this.modalService.showModal({
            statusCode,
            message,
            type: 'success',
            title: 'Éxito',
            autoCloseTime: 1500,
            showCloseButton: false
        });
    }

    /**
     * Muestra modal de error según status code
     */
    private showErrorModal(statusCode: string, customMessage?: string): void {
        const message = customMessage || this.getErrorMessage(statusCode);

        this.modalService.showModal({
            statusCode,
            message,
            type: 'error',
            title: 'Error',
            autoCloseTime: 0,
            showCloseButton: true
        });
    }

    /**
     * Obtiene mensaje de éxito según status code
     */
    private getSuccessMessage(statusCode: string): string {
        const messages: {[key: string]: string} = {
            '200': 'Operación completada correctamente',
            '201': 'Registro creado exitosamente',
            '202': 'Solicitud aceptada',
            '204': 'Operación completada'
        };

        return messages[statusCode] || 'Operación exitosa';
    }

    /**
     * Obtiene mensaje de error según status code
     */
    private getErrorMessage(statusCode: string): string {
        const messages: {[key: string]: string} = {
            '400': 'Solicitud incorrecta',
            '401': 'No autorizado',
            '403': 'Acceso denegado',
            '404': 'Recurso no encontrado',
            '409': 'Conflicto',
            '422': 'Datos inválidos',
            '429': 'Demasiados intentos',
            '500': 'Error interno del servidor',
            '503': 'Servicio no disponible',
            '0': 'Error de conexión'
        };

        return messages[statusCode] || 'Error desconocido';
    }
}