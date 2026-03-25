import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../../core/service/project.service';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-project-files',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToastModule,
    SkeletonModule
  ],
  templateUrl: './files.component.html',
  providers: [MessageService]
})
export class FilesComponent implements OnInit {
  projectId!: number;
  files: any[] = [];
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private messageService: MessageService
  ) {}

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
    if (file.model_type === 'messages') {
      this.router.navigate(['/project-management/projects/kanban', this.projectId, 'project-chat'], {
        queryParams: { messageId: file.model_id }
      });
    } else if (file.model_type === 'task_coments' || file.model_type === 'incidences') { // incidences is added just in case task attachment uses incidences
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
    if (modelType === 'messages') return 'Chat Grupal';
    if (modelType === 'task_coments') return 'Comentario de tarea';
    if (modelType === 'incidences') return 'Tarea';
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
}
