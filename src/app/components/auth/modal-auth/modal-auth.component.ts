import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
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
export class ModalAuthComponent implements OnInit, OnDestroy {
    @Output() confirmAction = new EventEmitter<void>();

    // Propiedades para el diseño
    iconClass = '';
    bgColor = '';
    textColor = '';
    showCloseButton = true;
    currentType: 'success' | 'error' | 'warning' | 'info' = 'info';
    currentStatusCode?: string;

    private modalStateSubscription!: Subscription;
    private currentMessage?: Confirmation;

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private modalService: TimedModalService
    ) {}

    ngOnInit() {
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
        this.showCloseButton = config.showCloseButton !== false;

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

    // Resto de los métodos se mantienen igual...
    private getTitleFromConfig(config: any): string {
        if (config.title) return config.title;

        switch(this.currentType) {
            case 'success': return 'Éxito';
            case 'error': return 'Error';
            case 'warning': return 'Advertencia';
            default: return 'Información';
        }
    }

    getTitle(message: Confirmation): string {
        return message.header || 'Información';
    }

    private setupModalStyle() {
        switch(this.currentType) {
            case 'success':
                this.iconClass = 'pi pi-check-circle text-4xl';
                this.bgColor = 'bg-green-50';
                this.textColor = 'text-green-800';
                break;
            case 'error':
                this.iconClass = 'pi pi-times-circle text-4xl';
                this.bgColor = 'bg-red-50';
                this.textColor = 'text-red-800';
                break;
            case 'warning':
                this.iconClass = 'pi pi-exclamation-triangle text-4xl';
                this.bgColor = 'bg-yellow-50';
                this.textColor = 'text-yellow-800';
                break;
            default: // info
                this.iconClass = 'pi pi-info-circle text-4xl';
                this.bgColor = 'bg-blue-50';
                this.textColor = 'text-blue-800';
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

    getButtonClass(type: 'success' | 'error' | 'warning' | 'info'): string {
        const baseClass = 'inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ';

        switch(type) {
            case 'success':
                return baseClass + 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
            case 'error':
                return baseClass + 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
            case 'warning':
                return baseClass + 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500';
            default:
                return baseClass + 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
        }
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
            this.confirmAction.emit();
        }

        this.modalService.hideModal();
    }

    private handleReject() {
        this.modalService.hideModal();
    }

    onBackdropClick(event: MouseEvent) {
        const config = this.modalService.modalConfigSignal();
        if (config.showCloseButton !== false) {
            const rejectButton = document.querySelector('[data-pc-section="rejectbutton"]') as HTMLElement;
            if (rejectButton) {
                rejectButton.click();
            }
        }
        event.stopPropagation();
    }
}