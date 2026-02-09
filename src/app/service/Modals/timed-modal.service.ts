import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';

export interface ModalConfig {
    statusCode: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    autoCloseTime?: number;
    showCloseButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class TimedModalService {
    private modalState = new BehaviorSubject<boolean>(false);
    private modalConfig = signal<ModalConfig>({
        statusCode: '',
        message: '',
        type: 'info',
        title: '',
        autoCloseTime: 0,
        showCloseButton: true
    });

    modalState$: Observable<boolean> = this.modalState.asObservable();

    modalConfigSignal = this.modalConfig.asReadonly();

    showModal(config: ModalConfig) {
        this.modalConfig.set({
            type: 'info',
            title: '',
            autoCloseTime: 0,
            showCloseButton: true,
            ...config
        });

        this.modalState.next(true);

        if (config.autoCloseTime && config.autoCloseTime > 0) {
            timer(config.autoCloseTime).subscribe(() => {
                this.hideModal();
            });
        }
    }

    showModalByStatusCode(statusCode: string, customMessage?: string) {
        const config: ModalConfig = {
            statusCode,
            message: customMessage || this.getDefaultMessage(statusCode),
            type: this.getTypeFromStatusCode(statusCode),
            autoCloseTime: 3000
        };

        this.showModal(config);
    }

    showSuccess(message: string, title?: string) {
        this.showModal({
            statusCode: '200',
            message,
            type: 'success',
            title: title || 'Éxito',
            autoCloseTime: 3000
        });
    }

    showError(message: string, title?: string) {
        this.showModal({
            statusCode: '400',
            message,
            type: 'error',
            title: title || 'Error',
            showCloseButton: true
        });
    }

    hideModal() {
        this.modalState.next(false);
    }

    private getTypeFromStatusCode(statusCode: string): 'success' | 'error' | 'warning' | 'info' {
        const code = parseInt(statusCode);
        if (code >= 200 && code < 300) return 'success';
        if (code >= 400 && code < 500) return 'error';
        if (code >= 500) return 'error';
        return 'info';
    }

    private getDefaultMessage(statusCode: string): string {
        const messages: {[key: string]: string} = {
            '200': 'Operación completada correctamente',
            '201': 'Registro creado exitosamente',
            '204': 'Sin contenido',
            '400': 'Solicitud incorrecta',
            '401': 'No autorizado',
            '403': 'Acceso denegado',
            '404': 'Recurso no encontrado',
            '409': 'Conflicto',
            '422': 'Entidad no procesable',
            '500': 'Error interno del servidor',
            '503': 'Servicio no disponible',
        };

        return messages[statusCode] || 'Operación completada';
    }
}
