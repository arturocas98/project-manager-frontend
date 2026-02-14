import { Component, inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de PrimeNG
import { ConfirmationService, MessageService, Confirmation } from 'primeng/api';

// Servicio personalizado
import { Subscription } from 'rxjs';
import {TimedModalService} from "../../../service/Modals/timed-modal.service";

@Component({
    selector: 'app-modal-auth',
    templateUrl: './modal-auth.component.html',
    // NO pongas providers aquí si ya los pusiste en AppModule
})
export class ModalAuthComponent{
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private modalService = inject(TimedModalService);

    // Propiedades para el diseño
    currentType: 'success' | 'error' | 'warning' | 'info' = 'info';
    currentStatusCode?: string;
    bgColor = '';
    textColor = '';
    iconBgColor = '';
    acceptButtonClass = '';
    rejectButtonClass = '';
    iconClass: string = '';

    private modalStateSubscription!: Subscription;

    constructor() {
        this.setupModalSubscriptions();
    }

    ngOnDestroy() {
        if (this.modalStateSubscription) {
            this.modalStateSubscription.unsubscribe();
        }
    }

    private setupModalSubscriptions() {
        this.modalStateSubscription = this.modalService.modalState$
            .subscribe(state => {
                if (state) {
                    this.showModal();
                }
            });
    }

    private showModal() {
        const config = this.modalService.modalConfigSignal();

        this.currentType = config.type || this.getTypeFromStatusCode(config.statusCode);
        this.currentStatusCode = config.statusCode;

        this.setupModalStyle();

        this.confirmationService.confirm({
            message: config.message,
            header: this.getTitleFromConfig(config),
            icon: 'none',
            accept: () => {
                this.handleAccept();
            },
            reject: () => {
                this.handleReject();
            },
            acceptLabel: this.getButtonText(this.currentType),
            rejectLabel: (this.currentType === 'error' || this.currentType === 'warning') ? 'Cancelar' : undefined,
            acceptButtonStyleClass: 'hidden',
            rejectButtonStyleClass: 'hidden',
        } as any);
    }

    getTitle(message: Confirmation): string {
        return message.header || 'Información';
    }

    private getTitleFromConfig(config: any): string {
        if (config.title) return config.title;

        switch(this.currentType) {
            case 'success': return 'Éxito';
            case 'error': return 'Error';
            case 'warning': return 'Advertencia';
            default: return 'Información';
        }
    }

    private setupModalStyle() {
        switch(this.currentType) {
            case 'success':
                this.iconClass = 'pi pi-check-circle';
                this.bgColor = 'bg-green-50';
                this.textColor = 'text-green-800';
                this.iconBgColor = 'bg-green-100';
                this.acceptButtonClass = 'bg-green-600 hover:bg-green-700 border-green-600';
                this.rejectButtonClass = 'border-green-600 text-green-600 hover:bg-green-50';
                break;
            case 'error':
                this.iconClass = 'pi pi-times-circle';
                this.bgColor = 'bg-red-50';
                this.textColor = 'text-red-800';
                this.iconBgColor = 'bg-red-100';
                this.acceptButtonClass = 'bg-red-600 hover:bg-red-700 border-red-600';
                this.rejectButtonClass = 'border-red-600 text-red-600 hover:bg-red-50';
                break;
            case 'warning':
                this.iconClass = 'pi pi-exclamation-triangle';
                this.bgColor = 'bg-yellow-50';
                this.textColor = 'text-yellow-800';
                this.iconBgColor = 'bg-yellow-100';
                this.acceptButtonClass = 'bg-yellow-600 hover:bg-yellow-700 border-yellow-600';
                this.rejectButtonClass = 'border-yellow-600 text-yellow-600 hover:bg-yellow-50';
                break;
            default: // info
                this.iconClass = 'pi pi-info-circle';
                this.bgColor = 'bg-blue-50';
                this.textColor = 'text-blue-800';
                this.iconBgColor = 'bg-blue-100';
                this.acceptButtonClass = 'bg-blue-600 hover:bg-blue-700 border-blue-600';
                this.rejectButtonClass = 'border-blue-600 text-blue-600 hover:bg-blue-50';
                break;
        }
    }

    private getTypeFromStatusCode(statusCode?: string): 'success' | 'error' | 'warning' | 'info' {
        if (!statusCode) return 'info';

        const code = parseInt(statusCode);
        if (code >= 200 && code < 300) return 'success';
        if (code >= 400 && code < 500) return 'error';
        if (code >= 500) return 'error';
        return 'info';
    }

    getButtonText(type: 'success' | 'error' | 'warning' | 'info'): string {
        switch(type) {
            case 'error':
            case 'warning':
                return 'Aceptar';
            default:
                return 'Cerrar';
        }
    }

    private handleAccept() {
        const config = this.modalService.modalConfigSignal();
        const type = config.type || this.getTypeFromStatusCode(config.statusCode);

        if (type === 'error' || type === 'warning') {
            // Emitir evento si es necesario
            // this.confirmAction.emit();
        }

        this.modalService.hideModal();
    }

    private handleReject() {
        this.modalService.hideModal();
    }
}