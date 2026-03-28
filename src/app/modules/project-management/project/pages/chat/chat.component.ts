import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../../../../core/service/project.service';
import { MessageResource, MessageRequest, MessageUpdateRequest } from '../../../../../shared/models/projects-models/message-models';

@Component({
  selector: 'app-project-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    AvatarModule,
    TooltipModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './chat.component.html',
  providers: [MessageService, ConfirmationService]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  projectId!: number;
  messages: MessageResource[] = [];
  newMessage: string = '';
  loading: boolean = true;
  submitting: boolean = false;
  currentUserId: number | null = null;
  selectedFile: File | null = null;

  replyToMessage: MessageResource | null = null;
  editingMessage: MessageResource | null = null;
  editMessageText: string = '';

  messageMenuItems: { [key: number]: MenuItem[] } = {};
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        this.currentUserId = profile.id || null;
      } catch (e) {
        console.error('Error parsing profile', e);
      }
    }

    const routeSub = this.route.parent?.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      if (this.projectId) {
        this.loadMessages();
      }
    });

    if (routeSub) this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  loadMessages(): void {
    this.loading = true;
    const msgSub = this.projectService.getProjectMessages(this.projectId).subscribe({
      next: (messages) => {
        let msgs = messages || [];
        msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        this.messages = msgs;
        this.buildMenuItems();
        this.loading = false;

        const messageId = this.route.snapshot.queryParams['messageId'];
        if (messageId) {
          setTimeout(() => {
            const el = document.getElementById('msg-' + messageId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        } else {
          this.shouldScrollToBottom = true;
        }
      },
      error: (error) => {
        console.error('Error loading messages', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los mensajes' });
        this.loading = false;
      }
    });
    this.subscriptions.push(msgSub);
  }

  buildMenuItems(): void {
    this.messages.forEach(msg => {
      if (msg.user?.id === this.currentUserId) {
        this.messageMenuItems[msg.id] = [
          {
            label: 'Editar',
            icon: 'ph ph-pencil-simple',
            command: () => this.startEdit(msg)
          },
          {
            label: 'Eliminar',
            icon: 'ph ph-trash',
            command: () => this.confirmDelete(msg)
          }
        ];
      } else {
        this.messageMenuItems[msg.id] = [
          {
            label: 'Responder',
            icon: 'ph ph-arrow-bend-up-left',
            command: () => this.setReply(msg)
          }
        ];
      }
    });
  }

  handleEnter(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.sendMessage();
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const maxSizeInBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        this.messageService.add({ severity: 'error', summary: 'Archivo demasiado grande', detail: 'El archivo no debe exceder los 10MB.' });
        event.target.value = '';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }


  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedFile) return;

    this.submitting = true;
    const payload: MessageRequest = {
      project_id: this.projectId,
      text: this.newMessage
    };

    if (this.replyToMessage) {
      payload.message_id = this.replyToMessage.id;
    }

    const sendSub = this.projectService.createProjectMessage(this.projectId, payload, this.selectedFile || undefined).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.buildMenuItems();
        this.newMessage = '';
        this.replyToMessage = null;
        this.selectedFile = null;
        this.submitting = false;
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar el mensaje' });
        this.submitting = false;
      }
    });
    this.subscriptions.push(sendSub);
  }

  setReply(msg: MessageResource): void {
    this.replyToMessage = msg;
    this.editingMessage = null;
  }

  cancelReply(): void {
    this.replyToMessage = null;
  }

  startEdit(msg: MessageResource): void {
    this.editingMessage = msg;
    this.editMessageText = msg.text || '';
    this.replyToMessage = null;
  }

  cancelEdit(): void {
    this.editingMessage = null;
    this.editMessageText = '';
  }

  saveEdit(): void {
    if (!this.editingMessage || !this.editMessageText.trim()) return;

    const payload: MessageUpdateRequest = {
      text: this.editMessageText
    };

    const editSub = this.projectService.updateProjectMessage(this.projectId, this.editingMessage.id, payload).subscribe({
      next: (updatedMsg) => {
        const index = this.messages.findIndex(m => m.id === updatedMsg.id);
        if (index !== -1) {
          this.messages[index] = updatedMsg;
        }
        this.buildMenuItems();
        this.editingMessage = null;
        this.editMessageText = '';
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el mensaje' });
      }
    });
    this.subscriptions.push(editSub);
  }

  confirmDelete(msg: MessageResource): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar este mensaje?',
      header: 'Confirmar Eliminación',
      icon: 'ph ph-warning-circle text-red-500',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteMessage(msg.id);
      }
    });
  }

  deleteMessage(id: number): void {
    const delSub = this.projectService.deleteProjectMessage(this.projectId, id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Mensaje eliminado' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el mensaje' });
      }
    });
    this.subscriptions.push(delSub);
  }

  getUserInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  getRoleNameInSpanish(role: string | null | undefined): string {
    if (!role) return 'Sin rol';
    const map: any = { administrator: 'Administrador', leader: 'Lider', developer: 'Desarrollador', tester: 'Tester', documenter: 'Documentador' };
    return map[role.toLowerCase()] || role;
  }
}
