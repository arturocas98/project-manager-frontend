import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../../core/service/project.service';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MediaService } from '../../../../../core/service/media.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-project-files',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToastModule,
    SkeletonModule,
    ConfirmDialogModule,
    FileUploadModule
  ],
  templateUrl: './files.component.html',
  providers: [MessageService, ConfirmationService]
})
export class FilesComponent implements OnInit {
  projectId!: number;
  files: any[] = [];
  loading: boolean = true;
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private messageService: MessageService,
    private mediaService: MediaService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    // Obtenemos el ID del proyecto de la ruta padre
    const routeSub = this.route.parent?.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      if (this.projectId) {
        this.loadFiles();
      }
    });
  }

  loadFiles(): void {
    this.loading = true;
    this.projectService.getProjectFiles(this.projectId).subscribe({
      next: (files) => {
        this.files = files;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading files', err);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los archivos' });
      }
    });
  }

  downloadFile(file: any): void {
    window.open(file.url, '_blank');
  }

  goToOrigin(file: any): void {
    console.log(file);

    const isMessage = file.model_type === 'message';
    const isTaskOrComment = file.model_type === 'task_comment';

    if (isMessage) {
      this.router.navigate(['/project-management/projects/kanban', this.projectId, 'project-chat'], {
        queryParams: { messageId: file.model_id }
      });
    } else if (isTaskOrComment) {
      // incidences is added just in case task attachment uses incidences
      this.router.navigate(['/project-management/projects/kanban', this.projectId, 'task-details', file.model_id]);
    }
  }

  getFileIcon(mimeType: string): string {
    if (!mimeType) return 'ph-file';
    if (mimeType.includes('pdf')) return 'ph-file-pdf text-red-500';
    if (mimeType.includes('image')) return 'ph-image text-blue-500';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'ph-file-doc text-blue-700';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'ph-file-xls text-green-600';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'ph-file-archive text-yellow-600';
    return 'ph-file text-500';
  }

  getOriginName(modelType: string): string {
    if (!modelType) return 'Proyecto';
    if (modelType === 'message' || String(modelType).includes('Message')) return 'Chat Grupal';
    if (modelType === 'task_coment' || String(modelType).includes('TaskComment')) return 'Comentario de tarea';
    if (modelType === 'incidence' || String(modelType).includes('Incidence')) return 'Tarea';
    return 'Proyecto';
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  uploading = false;
  onUpload(event: any, fileUploadCtrl: any) {
    const file = event.files[0];
    if (file) {
      this.uploading = true;
      this.mediaService.uploadMedia(file, 'project', this.projectId).subscribe({
        next: (uploadedFile) => {
          this.uploading = false;
          fileUploadCtrl.clear();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo subido correctamente' });
          this.files.unshift(uploadedFile);
        },
        error: (err) => {
          this.uploading = false;
          fileUploadCtrl.clear();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al subir archivo' });
        }
      });
    }
  }

  deleteFile(fileItem: any, event: Event) {
    if (event) event.stopPropagation();
    this.confirmationService.confirm({
      message: '¿Estás seguro que deseas eliminar permanentemente este archivo?',
      header: 'Confirmar eliminación',
      icon: 'ph ph-warning text-red-500',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.mediaService.deleteMedia(fileItem.id).subscribe({
          next: () => {
            this.files = this.files.filter(f => f.id !== fileItem.id);
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo eliminado' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al eliminar el archivo' });
          }
        });
      }
    });
  }
}
